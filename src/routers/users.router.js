import { Router } from "express";
import { signinValidation, signupValidation } from "../middlewares/users.validation.js";
import { getUser, signin, signup } from "../controllers/users.controllers.js";

const router = Router();

router.post("/signup", signupValidation, signup);
router.post("/signin", signinValidation, signin);
router.get("/users/me", getUser);
router.get("/ranking");

export default router;