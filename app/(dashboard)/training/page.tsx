import { getLiquidModels } from "@/lib/huggingface/client";
import type { ModelModality } from "@/lib/huggingface/types";
import { LiquidLFMSection } from "./components/liquid-lfm-section";

export default async function TrainingPage() {
  // Fetch models server-side with graceful fallback
  const models = await getLiquidModels();

  // Group models by modality for organized browsing
  const modelsByModality = models.reduce((acc, model) => {
    if (!acc[model.modality]) {
      acc[model.modality] = [];
    }
    acc[model.modality].push(model);
    return acc;
  }, {} as Record<ModelModality, typeof models>);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">Model Discovery</h1>
        <p className="mt-2 text-muted-foreground">
          Explore Liquid AI's family of efficient foundation models optimized for edge deployment and real-world applications.
        </p>
      </div>

      {/* Curated Liquid AI models section */}
      <LiquidLFMSection modelsByModality={modelsByModality} />

      {/* Placeholder for model search (Plan 02) */}
      <div id="model-search" className="mt-12">
        {/* Model search will be added in plan 03-02 */}
      </div>

      {/* Placeholder for AI recommender (Plan 03) */}
      <div id="ai-recommender" className="mt-12">
        {/* AI-powered model recommendations will be added in plan 03-03 */}
      </div>
    </div>
  );
}
