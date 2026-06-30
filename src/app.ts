import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import fastify from "fastify";
import { ZodError, z } from "zod";
import { env } from "./env";
import { healthCheckRoutes } from "./http/controllers/healthcheck/routes";
import { userRoutes } from "./http/controllers/users/routes";

export const app = fastify({
    requestTimeout: 10 * 1000, // 10 seconds
    handlerTimeout: 10 * 1000 // 10 seconds
})

app.register(fastifyJwt, {
    secret: env.SECRET_KEY,
    cookie: {
        cookieName: "refreshToken",
        signed: false,
    },
    sign: {
        expiresIn: "10m",
    },
})

app.register(fastifyCookie)

app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
        return reply.status(400).send({
            message: "Validation error.",
            issues: z.treeifyError(error),
        })
    }

    if (env.NODE_ENV !== "prod") {
        console.error(error)
    }

    return reply.status(500).send({ message: "Internal server error." })
})

app.register(healthCheckRoutes)
app.register(userRoutes)
