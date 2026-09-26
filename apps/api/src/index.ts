import { createApp } from "./app";
import { handleAnalysisBatch, type AnalysisJob } from "./services/analysis";

const app = createApp();

export default {
  fetch: app.fetch,
  queue: handleAnalysisBatch,
} satisfies ExportedHandler<Env, AnalysisJob>;
