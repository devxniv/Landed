import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authUser.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator, loginValidator } from "../validators/index.js";

const router = Router();

//unsecured routes which doesn't require jwt authentication
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(loginValidator(), validate, loginUser);
export default router;
