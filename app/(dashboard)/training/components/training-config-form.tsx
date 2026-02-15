"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { trainingJobSchema, type TrainingJobInput, hyperparameterRanges } from "@/lib/validations/training-job"
import { LIQUID_LFMS } from "@/lib/huggingface/liquid-lfm"
import { createTrainingJob } from "../configure/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle } from "lucide-react"

interface TrainingConfigFormProps {
  modelId?: string
}

export function TrainingConfigForm({ modelId }: TrainingConfigFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<TrainingJobInput>({
    resolver: zodResolver(trainingJobSchema),
    defaultValues: {
      name: "",
      modelId: modelId || "",
      learningRate: 0.0002,
      epochs: 3,
      batchSize: 16,
    },
  })

  const onSubmit = async (data: TrainingJobInput) => {
    setServerError(null)

    startTransition(async () => {
      const result = await createTrainingJob(data)

      if (result.success) {
        // Redirect to dashboard to see the new queued job
        router.push("/")
      } else {
        setServerError(result.error)
      }
    })
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Training Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        {serverError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Job Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., LFM-3B-finance-finetune"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for this training job
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Base Model */}
            <FormField
              control={form.control}
              name="modelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Model</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Liquid AI model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LIQUID_LFMS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({model.parameterCount})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the foundation model to fine-tune
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Learning Rate */}
            <FormField
              control={form.control}
              name="learningRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Learning Rate</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.000001"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Recommended: {hyperparameterRanges.learningRate.recommended} (range: {hyperparameterRanges.learningRate.min} - {hyperparameterRanges.learningRate.max})
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Epochs */}
            <FormField
              control={form.control}
              name="epochs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Epochs</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Recommended: {hyperparameterRanges.epochs.recommended} (range: {hyperparameterRanges.epochs.min} - {hyperparameterRanges.epochs.max})
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Batch Size */}
            <FormField
              control={form.control}
              name="batchSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch Size</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 4, 8, 16, 32, 64, 128].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Number of samples per update step (power of 2 for GPU efficiency)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full"
            >
              {isPending ? "Creating..." : "Create Training Job"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
