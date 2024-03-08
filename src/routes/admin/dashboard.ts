import { Router, Response } from "express";
import prisma from "../../libs/prisma";
import isAdminLogin from "../../libs/middlewares/isAdminLogin";
import { AdminLoginRequest } from "../../libs/types/AdminLoginRequest";

const router = Router();

router.get(
  "/",
  isAdminLogin,
  async (_: AdminLoginRequest, res: Response) => {
    const totalCamps = await prisma.camp.count({
      where: {
        name: {
          not: "Staff",
        },
      },
    });
    const totalCampers = await prisma.camper.count({
      where: {
        Camp: {
          name: {
            not: "Staff",
          },
        },
      },
    });
    const totalStaffs = await prisma.camper.count({
      where: {
        Camp: {
          name: "Staff",
        },
      },
    });

    res.send({
      totalCamps,
      totalCampers,
      totalStaffs,
    });
  }
);

export default router;
