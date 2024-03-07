import { Router } from "express";
import dashboardRouter from "./dashboard";
import camperRouter from "./camper";
import campRouter from "./camp";

const router = Router();

router.use("/dashboard", dashboardRouter);
router.use("/camper", camperRouter);
router.use("/camp", campRouter);

export default router;
