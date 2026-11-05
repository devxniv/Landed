import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
} from "../controllers/authUser.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator, loginValidator } from "../validators/index.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";
const authRouter = Router();

//unsecured routes which doesn't require jwt authentication(no access token needed)
authRouter
  .route("/register")
  .post(authLimiter, userRegisterValidator(), validate, registerUser);
authRouter
  .route("/login")
  .post(authLimiter, loginValidator(), validate, loginUser);

// these two read the refreshToken cookie instead of the Authorization header, Neither needs verifyJWT: the access token has usually expired by the time you refresh, and logout only needs the cookie.
authRouter.route("/refresh").post(authLimiter, refreshAccessToken);
authRouter.route("/logout").post(logoutUser);

export default authRouter;
