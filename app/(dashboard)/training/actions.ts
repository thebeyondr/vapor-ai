"use server";

/**
 * Server Actions for model search and recommendations
 */

import { z } from "zod";
import { HfInference } from "@huggingface/inference";
import { searchHuggingFaceModels } from "@/lib/huggingface/search";
import { LIQUID_LFMS } from "@/lib/huggingface/liquid-lfm";
import type { ModelInfo } from "@/lib/huggingface/types";

/**
 * Validation schemas
 */
const searchQuerySchema = z.string().min(1).max(100);

const recommendModelSchema = z.object({
  goal: z.string().min(5, "Goal must be at least 5 characters").max(500, "Goal must be less than 500 characters")
});

/**
 * Server Action: Search HuggingFace models
 *
 * @param query Search query string
 * @returns Search results or error
 */
export async function searchModels(query: string): Promise<{
  success: boolean;
  data: ModelInfo[];
  error?: string;
}> {
  // Handle empty query - return empty array without calling API
  if (!query || query.trim().length === 0) {
    return { success: true, data: [] };
  }

  // Validate query
  const validation = searchQuerySchema.safeParse(query);
  if (!validation.success) {
    return {
      success: false,
      data: [],
      error: "Invalid search query",
    };
  }

  // Delegate to search function
  return await searchHuggingFaceModels(validation.data);
}

/**
 * Recommendation result types
 */
export interface RecommendationResult {
  success: true;
  recommendations: ModelInfo[];
  reasoning: string;
  fallback?: boolean;
}

export interface RecommendationError {
  success: false;
  error: string;
}

type RecommendationResponse = RecommendationResult | RecommendationError;

/**
 * Server Action: Recommend models based on natural language training goal
 *
 * Uses LLM inference if HUGGINGFACE_TOKEN available, otherwise falls back to keyword matching
 *
 * @param goal Natural language description of training goal
 * @returns Recommended models with reasoning
 */
export async function recommendModel(goal: string): Promise<RecommendationResponse> {
  try {
    // Validate input
    const validated = recommendModelSchema.safeParse({ goal });
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0].message
      };
    }

    const userGoal = validated.data.goal;
    const token = process.env.HUGGINGFACE_TOKEN;

    // Primary path: LLM-powered recommendations
    if (token) {
      try {
        const hf = new HfInference(token);

        // Build catalog context for the LLM
        const catalogContext = LIQUID_LFMS.map(m =>
          `${m.name} (${m.id}): ${m.description} [Modality: ${m.modality}, Params: ${m.parameterCount}]`
        ).join("\n");

        const systemPrompt = `You are an AI model advisor helping users choose Liquid AI models for their use cases.

Available models:
${catalogContext}

Given a user's training goal, recommend 1-2 best-fit models with reasoning.
Respond ONLY with valid JSON in this exact format:
{
  "recommendations": [
    {"modelId": "exact-model-id-from-list", "reason": "why this model fits the goal"}
  ]
}`;

        const result = await hf.chatCompletion({
          model: "meta-llama/Llama-3.1-8B-Instruct",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `User goal: ${userGoal}` }
          ],
          max_tokens: 500,
          temperature: 0.7
        });

        // Parse LLM response
        const responseText = result.choices[0]?.message?.content || "";
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
          throw new Error("LLM did not return valid JSON");
        }

        const parsed = JSON.parse(jsonMatch[0]) as {
          recommendations: Array<{ modelId: string; reason: string }>;
        };

        // Match model IDs back to full ModelInfo objects
        const recommendedModels = parsed.recommendations
          .map(rec => {
            const model = LIQUID_LFMS.find(m => m.id === rec.modelId);
            return model ? { model, reason: rec.reason } : null;
          })
          .filter((item): item is { model: ModelInfo; reason: string } => item !== null)
          .slice(0, 2); // Max 2 recommendations

        if (recommendedModels.length === 0) {
          throw new Error("No valid model matches found");
        }

        // Build reasoning text
        const reasoning = recommendedModels
          .map(({ model, reason }) => `**${model.name}**: ${reason}`)
          .join("\n\n");

        return {
          success: true,
          recommendations: recommendedModels.map(r => r.model),
          reasoning
        };

      } catch (llmError) {
        // LLM failed, fall through to keyword fallback
        console.warn("LLM recommendation failed, using keyword fallback:", llmError);
      }
    }

    // Fallback path: Rule-based keyword matching
    const lowerGoal = userGoal.toLowerCase();
    let matchedModels: ModelInfo[] = [];
    let detectedModality = "text";

    // Keyword detection
    if (/(image|photo|visual|see|picture|vision|camera)/i.test(lowerGoal)) {
      detectedModality = "vision";
      matchedModels = LIQUID_LFMS.filter(m => m.modality === "vision");
    } else if (/(audio|sound|speech|voice|listen|music|recording)/i.test(lowerGoal)) {
      detectedModality = "audio";
      matchedModels = LIQUID_LFMS.filter(m => m.modality === "audio");
    } else if (/(edge|mobile|small|fast|lite|embedded|iot|device|phone|on-device|offline)/i.test(lowerGoal)) {
      detectedModality = "nano/edge";
      matchedModels = LIQUID_LFMS.filter(m => m.modality === "nano");
    } else {
      // Default to text models
      matchedModels = LIQUID_LFMS.filter(m => m.modality === "text");
    }

    // Take top 2 models from matched modality
    const recommendations = matchedModels.slice(0, 2);

    if (recommendations.length === 0) {
      // Ultimate fallback: return first 2 text models
      return {
        success: true,
        recommendations: LIQUID_LFMS.filter(m => m.modality === "text").slice(0, 2),
        reasoning: "Based on your goal, we recommend starting with our general-purpose text models.",
        fallback: true
      };
    }

    return {
      success: true,
      recommendations,
      reasoning: `Based on your goal mentioning ${detectedModality}-related keywords, we recommend these ${detectedModality} models.`,
      fallback: true
    };

  } catch (error) {
    console.error("recommendModel error:", error);
    return {
      success: false,
      error: "Unable to generate recommendations. Please try again."
    };
  }
}
