import { Router } from "express";
import { urlValidation } from "../middlewares/urls.validation.js";
import { deleteUrl, getUrlById, postUrlShorten, redirectUrls } from "../controllers/urls.controllers.js";

const router = Router();

router.post("/urls/shorten", urlValidation, postUrlShorten);
router.get("/urls/:id", getUrlById);
router.get("/urls/open/:shortUrl", redirectUrls);
router.delete("/urls/:id", deleteUrl);


export default router;