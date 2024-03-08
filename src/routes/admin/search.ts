import { Router, Request, Response } from "express";
import prisma from "../../libs/prisma";
import isAdminLogin from "../../libs/middlewares/isAdminLogin";
import { AdminLoginRequest } from "../../libs/types/AdminLoginRequest";

const router = Router();

router.get("/campers/", isAdminLogin , async (req: AdminLoginRequest, res: Response) => {
  try {
    const name = req.query.name as string;
    const camp = req.query.camp as string;
    if (!name) {
      const campers = await prisma.camper.findMany(
        {select: {
          id: true,
          name: true,
          Camp: true,
          zelaCode: true,
          ProfileImage: {
            select: {
              url: true,
            }
          }
        }}
      );
      return res.send(campers);
    }
    if (!camp) {
      const campers = await prisma.camper.findMany({
        where: {
          name: {
            contains: name,
          },
        },
        select: {
          id: true,
          name: true,
          Camp: true,
          zelaCode: true,
          ProfileImage: {
            select: {
              url: true,
            }
          }
        },
      });
      return res.send(campers);
    } else {
      const campers = await prisma.camper.findMany({
        where: {
          name: {
            contains: name,
          },
          Camp: {
            name: camp,
          },
        },
        select: {
          id: true,
          name: true,
          Camp: true,
          zelaCode: true,
          ProfileImage: {
            select: {
              url: true,
            }
          }
        },
      });
      return res.send(campers);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
});

export default router;
