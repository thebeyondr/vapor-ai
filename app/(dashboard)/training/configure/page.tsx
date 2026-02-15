import { Suspense } from "react"
import { TrainingConfigForm } from "../components/training-config-form"

interface ConfigurePageProps {
  searchParams: Promise<{
    model?: string
  }>
}

export default async function ConfigurePage({ searchParams }: ConfigurePageProps) {
  const params = await searchParams
  const modelId = params.model

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Configure Training Job</h1>
        <p className="mt-2 text-muted-foreground">
          Set up hyperparameters and configure your model fine-tuning job.
        </p>
      </div>

      <Suspense fallback={<div>Loading form...</div>}>
        <TrainingConfigForm modelId={modelId} />
      </Suspense>
    </div>
  )
}
