import { FastifyInstance } from "fastify";
import { getHealthCheck } from "./healthcheck";

export async function healthCheckRoutes(app: FastifyInstance) {
    app.get("/healthcheck", getHealthCheck)
}