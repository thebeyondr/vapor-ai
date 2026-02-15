import { getLiquidModels } from "@/lib/huggingface/client";
import type { ModelModality } from "@/lib/huggingface/types";
import { AiRecommender } from "./components/ai-recommender";
import { LiquidLFMSection } from "./components/liquid-lfm-section";
import { ModelSearch } from "./components/model-search";
import { Separator } from "@/components/ui/separator";

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

      {/* AI Model Advisor - Hero feature */}
      <AiRecommender />

      {/* Separator between recommender and curated sections */}
      <Separator className="my-12" />

      {/* Curated Liquid AI models section */}
      <LiquidLFMSection modelsByModality={modelsByModality} />

      {/* Separator between curated and search sections */}
      <Separator className="my-12" />

      {/* Model search section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Search All Models</h2>
          <p className="mt-2 text-muted-foreground">
            Explore the entire HuggingFace ecosystem to find the perfect model for your use case.
          </p>
        </div>
        <ModelSearch />
      </div>
    </div>
  );
}
