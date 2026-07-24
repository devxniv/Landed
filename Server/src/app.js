import express from "express";
const app = express();
app.use(express.json());

//unsecured routes which doesn't require jwt authentication
import healthCheckRouter from "./routes/healthcheck.route.js";
import router from "./routes/auth.routes.js";

app.use("/v1/healthcheck", healthCheckRouter);
app.use("/v1/auth", router);

export default app;
