import { createApp } from "./app";
import { handleAnalysisBatch, type AnalysisJob } from "./services/analysis";
import { handleWatermarkBatch, type WatermarkJob } from "./services/watermark";

const app = createApp();

export default {
  fetch: app.fetch,
  // One consumer per queue in wrangler.jsonc.
  async queue(batch, env) {
    if (batch.queue === "qb-pdf-watermark") {
      await handleWatermarkBatch(batch as MessageBatch<WatermarkJob>, env);
    } else {
      await handleAnalysisBatch(batch as MessageBatch<AnalysisJob>, env);
    }
  },
} satisfies ExportedHandler<Env, AnalysisJob | WatermarkJob>;
