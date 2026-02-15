"use client";

/**
 * AI-powered model recommender component
 * Users describe their training goal in natural language and receive personalized model recommendations
 */

import { useState, useTransition } from "react";
import { Sparkles, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModelCard } from "./model-card";
import { recommendModel, type RecommendationResult } from "../actions";
import type { ModelInfo } from "@/lib/huggingface/types";

type DisplayState =
  | { type: "idle" }
  | { type: "pending" }
  | { type: "results"; data: RecommendationResult }
  | { type: "error"; message: string };

export function AiRecommender() {
  const [goal, setGoal] = useState("");
  const [state, setState] = useState<DisplayState>({ type: "idle" });
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (goal.trim().length < 5) return;

    startTransition(async () => {
      setState({ type: "pending" });

      const result = await recommendModel(goal);

      if (result.success) {
        setState({ type: "results", data: result });
      } else {
        setState({ type: "error", message: result.error });
      }
    });
  };

  const handleReset = () => {
    setGoal("");
    setState({ type: "idle" });
  };

  const isInputDisabled = isPending || state.type === "pending";
  const isSubmitDisabled = goal.trim().length < 5 || isInputDisabled;

  return (
    <Card className="relative overflow-hidden border-2" style={{ borderColor: "hsl(var(--primary) / 0.2)" }}>
      {/* Subtle gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">AI Model Advisor</CardTitle>
        </div>
        <CardDescription>
          Describe your training goal and get personalized recommendations
        </CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="e.g., I want to build a chatbot that runs on mobile devices..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={isInputDisabled}
            className="min-h-[100px] resize-none"
            maxLength={500}
          />

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {isPending || state.type === "pending" ? "Thinking..." : "Get Recommendations"}
            </Button>

            {state.type === "results" && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Try Another
              </Button>
            )}

            <div className="text-xs text-muted-foreground ml-auto">
              {goal.length}/500
            </div>
          </div>
        </form>

        {/* Loading state */}
        {(isPending || state.type === "pending") && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span>Analyzing your goal...</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {state.type === "error" && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              <span>{state.message}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="ml-4"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Results state */}
        {state.type === "results" && (
          <div className="space-y-4 pt-4 border-t">
            {/* Reasoning */}
            <Alert>
              <AlertDescription className="text-sm">
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: state.data.reasoning.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
              </AlertDescription>
            </Alert>

            {/* Fallback indicator */}
            {state.data.fallback && (
              <p className="text-xs text-muted-foreground italic">
                AI advisor unavailable — showing keyword-based suggestions
              </p>
            )}

            {/* Recommended models */}
            <div className="grid gap-4 md:grid-cols-2">
              {state.data.recommendations.map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
