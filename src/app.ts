import path from "node:path";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import fastifyStatic from "@fastify/static";
import fastify from "fastify";
import { ZodError, z } from "zod";
import { env } from "./env";
import { catalogExerciseRoutes } from "./http/controllers/catalog-exercises/routes";
import { exerciseTemplateRoutes } from "./http/controllers/exercise-templates/routes";
import { exerciseRoutes } from "./http/controllers/exercises/routes";
import { healthCheckRoutes } from "./http/controllers/healthcheck/routes";
import { metricRoutes } from "./http/controllers/metrics/routes";
import { preferenceRoutes } from "./http/controllers/preferences/routes";
import { setRoutes } from "./http/controllers/sets/routes";
import { trainmentTemplateRoutes } from "./http/controllers/trainment-templates/routes";
import { trainmentRoutes } from "./http/controllers/trainments/routes";
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

// Catalog exercise images ship with the app; served off the API namespace so
// `/static/...` never collides with `/catalog/exercises/:id`.
app.register(fastifyStatic, {
    root: path.resolve(process.cwd(), "public"),
    prefix: "/static/",
})

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
app.register(trainmentTemplateRoutes)
app.register(trainmentRoutes)
app.register(catalogExerciseRoutes)
app.register(exerciseTemplateRoutes)
app.register(exerciseRoutes)
app.register(setRoutes)
app.register(metricRoutes)
app.register(preferenceRoutes)
