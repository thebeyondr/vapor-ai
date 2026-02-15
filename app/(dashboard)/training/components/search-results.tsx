/**
 * Search results grid component
 */

import type { ModelInfo } from "@/lib/huggingface/types";
import { ModelCard } from "./model-card";
import { AlertCircle, SearchX } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SearchResultsProps {
  results: ModelInfo[];
  query: string;
  error?: string;
}

export function SearchResults({ results, query, error }: SearchResultsProps) {
  return (
    <div className="space-y-4">
      {/* Results header */}
      <div className="flex items-baseline gap-2">
        <h3 className="text-lg font-semibold">
          Search results for '{query}'
        </h3>
        <span className="text-sm text-muted-foreground">
          ({results.length} {results.length === 1 ? "result" : "results"})
        </span>
      </div>

      {/* Error/fallback notice */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Empty state */}
      {results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No models found for '{query}'
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Try different keywords or browse the curated Liquid AI models above.
          </p>
        </div>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      )}
    </div>
  );
}
