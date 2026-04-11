import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { runSequentialPipeline } from "./orchestrator.js";
import { createJob, getJob } from "./store.js";
import { CreateJobRequest } from "./types.js";
import { parseEnv } from "./env.js";
import { AIProvider } from "./ai.js";
import 'dotenv/config';

const env = parseEnv();
const aiProvider = new AIProvider(env.openaiApiKey, env.googleApiKey);

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true
});

const createJobSchema = z.object({
  task: z.string().min(1)
});

app.get("/health", async () => ({ ok: true }));

app.post("/api/jobs", async (request: FastifyRequest, reply: FastifyReply) => {
  const body = createJobSchema.safeParse(request.body as CreateJobRequest);
  if (!body.success) {
    return reply.code(400).send({
      error: "Invalid payload",
      details: body.error.flatten()
    });
  }

  const job = createJob(body.data.task);
  runSequentialPipeline(job.id, aiProvider, env.gitAuthorName, env.gitAuthorEmail).catch((error) => {
    request.log.error({ error, jobId: job.id }, "Pipeline execution failed");
  });

  return reply.code(202).send({
    jobId: job.id,
    status: job.status
  });
});

app.get("/api/jobs/:id", async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { id?: string };
  if (!params.id) {
    return reply.code(400).send({ error: "Missing job id" });
  }

  const job = getJob(params.id);
  if (!job) {
    return reply.code(404).send({ error: "Job not found" });
  }

  return reply.send(job);
});

app.listen({ port: env.port, host: env.host }).catch((error: unknown) => {
  app.log.error(error);
  process.exit(1);
});
