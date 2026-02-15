"use client";

/**
 * Debounced model search component with loading states
 */

import { useState, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchModels } from "../actions";
import { SearchResults } from "./search-results";
import type { ModelInfo } from "@/lib/huggingface/types";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ModelSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    success: boolean;
    data: ModelInfo[];
    error?: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Debounced search with 300ms delay
  const debouncedSearch = useDebouncedCallback((value: string) => {
    if (!value.trim()) {
      setResults(null);
      return;
    }

    startTransition(async () => {
      const result = await searchModels(value);
      setResults(result);
    });
  }, 300);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    setResults(null);
  };

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search HuggingFace models..."
          value={query}
          onChange={handleChange}
          className="pl-9 pr-9"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Loading skeletons */}
      {isPending && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-16 w-full" />
            </Card>
          ))}
        </div>
      )}

      {/* Search results */}
      {!isPending && results && query && (
        <SearchResults results={results.data} query={query} error={results.error} />
      )}
    </div>
  );
}
