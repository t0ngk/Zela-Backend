import { Router } from "express";
import dashboardRouter from "./dashboard";
import camperRouter from "./camper";
import campRouter from "./camp";
import profileRouter from "./profile";
import searchRouter from "./search";

const router = Router();

router.use("/dashboard", dashboardRouter);
router.use("/camper", camperRouter);
router.use("/camp", campRouter);
router.use("/profile", profileRouter);
router.use("/search", searchRouter);

export default router;
