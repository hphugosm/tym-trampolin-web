import { randomUUID } from "node:crypto";
import { JobRecord } from "./types.js";

const jobs = new Map<string, JobRecord>();

export function createJob(task: string): JobRecord {
  const now = new Date().toISOString();
  const job: JobRecord = {
    id: randomUUID(),
    task,
    status: "queued",
    stage: "planner",
    createdAt: now,
    updatedAt: now,
    trace: []
  };

  jobs.set(job.id, job);
  return job;
}

export function getJob(id: string): JobRecord | undefined {
  return jobs.get(id);
}

export function upsertJob(job: JobRecord): void {
  job.updatedAt = new Date().toISOString();
  jobs.set(job.id, job);
}
