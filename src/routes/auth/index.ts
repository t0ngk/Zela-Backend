import { Router } from "express";
import camper from "../auth/camper";
import admin from "../auth/admin";

const router = Router();

//PATH /auth/camper
router.use("/camper", camper);

//PATH /auth/admin
router.use("/admin", admin);

export default router;
