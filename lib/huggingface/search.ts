/**
 * HuggingFace model search with caching and fallback
 *
 * Searches HuggingFace Hub API for models, with graceful fallback to
 * filtering the curated LIQUID_LFMS catalog on API errors (including rate limits).
 */

import { listModels } from "@huggingface/hub";
import type { ModelInfo, ModelModality } from "./types";
import { LIQUID_LFMS } from "./liquid-lfm";

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

    // Search HuggingFace models with query
    for await (const model of listModels({
      search: { query },
      limit: 20,
      credentials,
    })) {
      // Default modality to "text" since we can't reliably infer from basic ModelEntry
      const modality: ModelModality = "text";

      models.push({
        id: model.id,
        name: model.name || model.id,
        modality,
        description: `HuggingFace model: ${model.id}`,
        parameterCount: "Unknown",
        architecture: "Unknown",
        downloads: model.downloads,
      });
    }

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
