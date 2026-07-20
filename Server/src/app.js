import express from "express";

//Rote imports
const app = express();

import healthCheckRouter from "./routes/healthcheck.route.js";

app.use("/api/v1/healthcheck", healthCheckRouter);
export default app;
