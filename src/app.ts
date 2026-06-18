import fastify from "fastify";
import { healthCheckRoutes } from "./http/controllers/healthcheck/routes";

export const app = fastify({
    requestTimeout: 10 * 1000, // 10 seconds
    handlerTimeout: 10 * 1000 // 10 seconds
})

app.setErrorHandler((error, _request, reply) => {
    /* handle zod errors here */
    /* TODO */ 
})



app.register(healthCheckRoutes)
/* To register routes 

app.register(userRoutes)
*/