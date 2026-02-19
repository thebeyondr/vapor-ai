/**
 * HuggingFace model types and interfaces
 */

export type ModelModality = "text" | "vision" | "audio" | "nano";

export interface ModelInfo {
  id: string;
  name: string;
  modality: ModelModality;
  description: string;
  parameterCount: string;
  architecture: string;
  downloads?: number;
  likes?: number;
  tags?: string[];
}
