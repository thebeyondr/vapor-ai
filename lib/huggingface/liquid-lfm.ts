/**
 * Curated Liquid AI LFM catalog with modality groupings
 *
 * This serves as:
 * 1. Static fallback data when HuggingFace API is unavailable
 * 2. Reference catalog for official Liquid AI models
 */

import type { ModelInfo, ModelModality } from "./types";

export const LIQUID_LFMS: ModelInfo[] = [
  // Text models
  {
    id: "LiquidAI/LFM2-1.2B",
    name: "LFM2 1.2B",
    modality: "text",
    description: "Efficient 1.2B parameter text generation model with state-of-the-art performance per parameter. Optimized for deployment on edge devices with minimal memory footprint.",
    parameterCount: "1.2B",
    architecture: "LFM2",
    tags: ["text-generation", "efficient", "edge-deployment"]
  },
  {
    id: "LiquidAI/LFM2-350M",
    name: "LFM2 350M",
    modality: "nano",
    description: "Ultra-compact 350M parameter model designed for nano/edge deployment. Perfect for on-device inference with minimal compute requirements while maintaining strong performance.",
    parameterCount: "350M",
    architecture: "LFM2",
    tags: ["text-generation", "nano", "edge", "mobile"]
  },
  {
    id: "LiquidAI/LFM2-3B",
    name: "LFM2 3B",
    modality: "text",
    description: "Powerful 3B parameter text model balancing capability with efficiency. Ideal for tasks requiring deeper reasoning while staying deployable on consumer hardware.",
    parameterCount: "3B",
    architecture: "LFM2",
    tags: ["text-generation", "reasoning", "efficient"]
  },

  // Vision models
  {
    id: "LiquidAI/LFM2.5-VL-1.6B",
    name: "LFM2.5 Vision-Language 1.6B",
    modality: "vision",
    description: "Multimodal vision-language model with 1.6B parameters. Combines visual understanding with language capabilities for image captioning, VQA, and visual reasoning tasks.",
    parameterCount: "1.6B",
    architecture: "LFM2.5-VL",
    tags: ["vision-language", "multimodal", "image-text"]
  },
  {
    id: "LiquidAI/LFM2.5-VL-3.2B",
    name: "LFM2.5 Vision-Language 3.2B",
    modality: "vision",
    description: "Advanced vision-language model with enhanced visual understanding and reasoning. Excels at complex image analysis and detailed visual question answering.",
    parameterCount: "3.2B",
    architecture: "LFM2.5-VL",
    tags: ["vision-language", "multimodal", "advanced"]
  },

  // Audio models
  {
    id: "LiquidAI/LFM2.5-Audio-1.5B",
    name: "LFM2.5 Audio 1.5B",
    modality: "audio",
    description: "Specialized audio understanding model with 1.5B parameters. Handles audio classification, speech recognition, and audio event detection with high efficiency.",
    parameterCount: "1.5B",
    architecture: "LFM2.5-Audio",
    tags: ["audio-classification", "speech", "audio-processing"]
  },
  {
    id: "LiquidAI/LFM2.5-Audio-800M",
    name: "LFM2.5 Audio 800M",
    modality: "audio",
    description: "Compact audio model optimized for real-time processing. Ideal for streaming audio applications and edge deployment scenarios requiring low latency.",
    parameterCount: "800M",
    architecture: "LFM2.5-Audio",
    tags: ["audio-classification", "real-time", "edge"]
  },

  // Additional nano model
  {
    id: "LiquidAI/LFM2-70M",
    name: "LFM2 70M",
    modality: "nano",
    description: "Tiny 70M parameter model for extreme edge deployment. Runs efficiently on microcontrollers and IoT devices with severely constrained resources.",
    parameterCount: "70M",
    architecture: "LFM2",
    tags: ["nano", "iot", "microcontroller", "extreme-edge"]
  }
];

/**
 * Models grouped by modality for organized browsing
 */
export const LIQUID_LFMS_BY_MODALITY: Record<ModelModality, ModelInfo[]> = {
  text: LIQUID_LFMS.filter(m => m.modality === "text"),
  vision: LIQUID_LFMS.filter(m => m.modality === "vision"),
  audio: LIQUID_LFMS.filter(m => m.modality === "audio"),
  nano: LIQUID_LFMS.filter(m => m.modality === "nano")
};

/**
 * Metadata for modality sections (icons, labels, descriptions)
 */
export const MODALITY_META: Record<ModelModality, {
  label: string;
  icon: string;
  description: string
}> = {
  text: {
    label: "Text Models",
    icon: "Type",
    description: "General-purpose language models for text generation, analysis, and reasoning"
  },
  vision: {
    label: "Vision Models",
    icon: "Eye",
    description: "Multimodal models combining visual understanding with language capabilities"
  },
  audio: {
    label: "Audio Models",
    icon: "AudioLines",
    description: "Specialized models for audio classification, speech recognition, and audio processing"
  },
  nano: {
    label: "Nano/Edge Models",
    icon: "Cpu",
    description: "Ultra-compact models optimized for edge deployment and resource-constrained environments"
  }
};
