/**
 * HuggingFace model search with caching and fallback
 *
 * Searches HuggingFace Hub API for models, with graceful fallback to
 * filtering the curated LIQUID_LFMS catalog on API errors (including rate limits).
 */

import { listModels } from "@huggingface/hub";
import type { ModelInfo, ModelModality } from "./types";
import { LIQUID_LFMS } from "./liquid-lfm";

const PIPELINE_TO_MODALITY: Record<string, ModelModality> = {
  "text-generation": "text",
  "text2text-generation": "text",
  "text-classification": "text",
  "token-classification": "text",
  "question-answering": "text",
  "fill-mask": "text",
  "summarization": "text",
  "translation": "text",
  "conversational": "text",
  "sentence-similarity": "text",
  "feature-extraction": "text",
  "image-classification": "vision",
  "object-detection": "vision",
  "image-segmentation": "vision",
  "image-to-text": "vision",
  "text-to-image": "vision",
  "automatic-speech-recognition": "audio",
  "audio-classification": "audio",
  "text-to-speech": "audio",
  "text-to-audio": "audio",
};

function formatParamCount(total: number): string {
  if (total >= 1e12) return `${(total / 1e12).toFixed(1)}T`;
  if (total >= 1e9) return `${(total / 1e9).toFixed(1)}B`;
  if (total >= 1e6) return `${(total / 1e6).toFixed(0)}M`;
  if (total >= 1e3) return `${(total / 1e3).toFixed(0)}K`;
  return String(total);
}

function displayName(id: string): string {
  // "meta-llama/Llama-3.1-8B-Instruct" -> "Llama-3.1-8B-Instruct"
  // Falls back to full id if repo name is numeric or too short
  if (!id.includes("/")) return id;
  const repo = id.split("/")[1];
  if (/^\d+$/.test(repo) || repo.length < 3) return id;
  return repo;
}

/**
 * Search HuggingFace models with graceful fallback to static data
 *
 * @param query Search query string
 * @returns Result object with success status, data array, and optional error message
 */
export async function searchHuggingFaceModels(
  query: string
): Promise<{ success: boolean; data: ModelInfo[]; error?: string }> {
  try {
    // Attempt to search HuggingFace API
    const credentials = process.env.HUGGINGFACE_TOKEN
      ? { accessToken: process.env.HUGGINGFACE_TOKEN }
      : undefined;

    const models: ModelInfo[] = [];

    // Search HuggingFace models with query, requesting extra fields
    for await (const model of listModels({
      search: { query },
      limit: 20,
      additionalFields: ["safetensors", "tags", "library_name"],
      credentials,
    })) {
      const pipelineTag = model.task ?? "";
      const modality: ModelModality = PIPELINE_TO_MODALITY[pipelineTag] ?? "text";
      const paramTotal = model.safetensors?.total;
      const parameterCount = paramTotal ? formatParamCount(paramTotal) : undefined;
      const library = model.library_name ?? undefined;

      // HF SDK maps: model.id = internal _id (hex), model.name = "org/repo-name"
      const fullId = model.name;

      models.push({
        id: fullId,
        name: displayName(fullId),
        modality,
        description: model.tags?.slice(0, 3).join(", ") || pipelineTag || fullId,
        parameterCount: parameterCount ?? (library || "Model"),
        architecture: library || pipelineTag || "Transformer",
        downloads: model.downloads,
        likes: model.likes,
        tags: model.tags?.slice(0, 5),
      });
    }

    // Sort by downloads descending — most popular models first
    models.sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0));

    // Return successful API results
    if (models.length > 0) {
      return { success: true, data: models };
    }

    // Empty results - fall back to filtering static data
    console.warn(
      "HuggingFace API returned no results, falling back to static data"
    );
    const fallbackResults = filterLiquidModels(query);
    return {
      success: true,
      data: fallbackResults,
      error: "Using cached results (HuggingFace API returned no matches)",
    };
  } catch (error) {
    // API error (including 429 rate limit) - fall back to static data
    console.warn(
      "HuggingFace API error, falling back to static data:",
      error
    );
    const fallbackResults = filterLiquidModels(query);
    return {
      success: true,
      data: fallbackResults,
      error: "Using cached results (HuggingFace API unavailable)",
    };
  }
}

/**
 * Filter LIQUID_LFMS by query string (case-insensitive)
 * Matches against name, description, and architecture
 */
function filterLiquidModels(query: string): ModelInfo[] {
  const lowerQuery = query.toLowerCase();

  return LIQUID_LFMS.filter((model) => {
    return (
      model.name.toLowerCase().includes(lowerQuery) ||
      model.description.toLowerCase().includes(lowerQuery) ||
      model.architecture.toLowerCase().includes(lowerQuery) ||
      model.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  });
}
