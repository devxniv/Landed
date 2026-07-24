import { body } from "express-validator";

const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be atleast 8 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain atleast one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain atleast one lowercase letter")
      .matches(/[0-9]/)
      .withMessage(/[^A-Za-z0-9]/)
      .withMessage("Password must contain at least one special character"),

    body("Fullname").optional().trim(),
  ];
};

const loginValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};
export { userRegisterValidator, loginValidator };
