import type { EnqueueEventJob, EventQueue } from '../event-queue'

export class InMemoryEventQueue implements EventQueue {
  public jobs: EnqueueEventJob[] = []

  async add(job: EnqueueEventJob) {
    this.jobs.push(job)
  }
}
