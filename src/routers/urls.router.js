import { Router } from "express";
import { urlValidation } from "../middlewares/urls.validation.js";
import { postUrlShorten } from "../controllers/urls.controllers.js";

const router = Router();

router.post("/urls/shorten", urlValidation, postUrlShorten);
router.get("/urls/:id");
router.get("/urls/open/:shortUrl");
router.delete("/urls/:id");


export default router;