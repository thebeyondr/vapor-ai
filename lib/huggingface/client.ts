/**
 * HuggingFace Hub client for fetching model data
 *
 * Tries HuggingFace API first, falls back to static data on failure.
 * Optional HUGGINGFACE_TOKEN env var for authenticated requests (not required for public models).
 */

import { listModels } from "@huggingface/hub";
import type { ModelInfo } from "./types";
import { LIQUID_LFMS, LIQUID_LFMS_BY_MODALITY } from "./liquid-lfm";

/**
 * Fetch Liquid AI models from HuggingFace Hub with fallback to static data
 *
 * @returns Array of ModelInfo objects
 */
export async function getLiquidModels(): Promise<ModelInfo[]> {
  try {
    // Attempt to fetch from HuggingFace API
    const credentials = process.env.HUGGINGFACE_TOKEN
      ? { accessToken: process.env.HUGGINGFACE_TOKEN }
      : undefined;

    const models = [];

    // List models from LiquidAI organization
    for await (const model of listModels({
      search: { owner: "LiquidAI" },
      credentials,
    })) {
      // HF SDK maps: model.id = internal _id (hex), model.name = "org/repo-name"
      const staticMatch = LIQUID_LFMS.find(m => m.id === model.name);

      if (staticMatch) {
        models.push({
          ...staticMatch,
          // Update with live download count if available
          downloads: model.downloads
        });
      }
    }

    // If we got models from API, return them
    if (models.length > 0) {
      return models;
    }

    // Otherwise fall through to static fallback
    console.warn("HuggingFace API returned no models, using static fallback");
    return LIQUID_LFMS;

  } catch (error) {
    // Log warning and fall back to static data
    console.warn("Failed to fetch models from HuggingFace API, using static fallback:", error);
    return LIQUID_LFMS;
  }
}

/**
 * Export modality-grouped static data for direct import if needed
 */
export { LIQUID_LFMS_BY_MODALITY };
