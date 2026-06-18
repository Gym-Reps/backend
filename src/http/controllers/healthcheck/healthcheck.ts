import { FastifyReply, FastifyRequest } from "fastify";

export async function getHealthCheck(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
        message: "Server is healthy"
    })
}
