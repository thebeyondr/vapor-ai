/**
 * Curated Liquid AI LFM section with modality groupings
 */

import type { ModelInfo, ModelModality } from "@/lib/huggingface/types";
import { MODALITY_META } from "@/lib/huggingface/liquid-lfm";
import { Separator } from "@/components/ui/separator";
import { ModelCard } from "./model-card";
import * as Icons from "lucide-react";

interface LiquidLFMSectionProps {
  modelsByModality: Record<ModelModality, ModelInfo[]>;
}

export function LiquidLFMSection({ modelsByModality }: LiquidLFMSectionProps) {
  // Type-safe icon getter
  const getIcon = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
    return Icon || Icons.HelpCircle;
  };

  return (
    <div className="space-y-8">
      {(Object.keys(modelsByModality) as ModelModality[]).map((modality, index) => {
        const models = modelsByModality[modality];

        // Skip empty modality sections
        if (!models || models.length === 0) return null;

        const meta = MODALITY_META[modality];
        const Icon = getIcon(meta.icon);

        return (
          <div key={modality}>
            {/* Separator between sections (not before first section) */}
            {index > 0 && <Separator className="my-8" />}

            {/* Section header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Icon className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">{meta.label}</h2>
              </div>
              <p className="text-sm text-muted-foreground">{meta.description}</p>
            </div>

            {/* Model cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
