import { Router } from "express";
import dashboardRouter from "./dashboard";
import camperRouter from "./camper";
import campRouter from "./camp";
import profileRouter from "./profile";

const router = Router();

router.use("/dashboard", dashboardRouter);
router.use("/camper", camperRouter);
router.use("/camp", campRouter);
router.use("/profile", profileRouter);

export default router;
