/**
 * Model card component displaying Liquid AI LFM metadata
 */

import type { ModelInfo } from "@/lib/huggingface/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, Download, Heart } from "lucide-react";

interface ModelCardProps {
  model: ModelInfo;
}

// Modality color mapping for visual indicators
const MODALITY_COLORS = {
  text: "bg-blue-500",
  vision: "bg-purple-500",
  audio: "bg-green-500",
  nano: "bg-orange-500",
} as const;

export function ModelCard({ model }: ModelCardProps) {
  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      {/* Modality indicator dot */}
      <div
        className={cn(
          "absolute right-3 top-3 h-2 w-2 rounded-full",
          MODALITY_COLORS[model.modality]
        )}
        title={`${model.modality} model`}
      />

      <CardHeader>
        <CardTitle className="text-lg">{model.name}</CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            {model.parameterCount}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {model.architecture}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {model.description}
        </p>

        {(model.downloads != null || model.likes != null) && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {model.downloads != null && (
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {model.downloads.toLocaleString()}
              </span>
            )}
            {model.likes != null && model.likes > 0 && (
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {model.likes.toLocaleString()}
              </span>
            )}
          </div>
        )}

        {model.tags && model.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {model.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Button asChild variant="outline" size="sm" className="w-full mt-3">
          <Link href={`/training/configure?model=${encodeURIComponent(model.id)}`}>
            Configure Training
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
