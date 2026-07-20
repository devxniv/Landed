import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js";

const router = Router();
router.route("/").get(healthCheck); //when a GET request hits this path, run the healthCheck function

export default router;
