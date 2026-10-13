import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authUser.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator, loginValidator } from "../validators/index.js";

const authRouter = Router();

//unsecured routes which doesn't require jwt authentication
authRouter
  .route("/register")
  .post(userRegisterValidator(), validate, registerUser);
authRouter.route("/login").post(loginValidator(), validate, loginUser);
export default authRouter;
