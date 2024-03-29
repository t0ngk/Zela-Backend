import { Router, Request, Response } from "express";
import prisma from "../../libs/prisma";
import isCamperLogin from "../../libs/middlewares/isCamperLogin";
import { CamperLoginRequest } from "../../libs/types/CamperLoginRequest";

const router = Router();

router.get("/camps", async (_, res: Response) => {
  const camps = await prisma.camp.findMany({
    select: {
      id: true,
      name: true,
      color: true,
    },
  });
  res.send(camps);
});

router.get(
  "/campers/",
  isCamperLogin,
  async (req: CamperLoginRequest, res: Response) => {
    try {
      const name = req.query.name as string;
      const camp = req.query.camp as string;
      if (!name && !camp) {
        const campers = await prisma.camper.findMany({
          where: {
            NOT: {
              name: req.user?.name,
            },
          },
          select: {
            id: true,
            name: true,
            Camp: true,
            ProfileImage: {
              select: {
                url: true,
              },
            },
          },
        });
        return res.send(campers);
      }
      if (!camp) {
        const campers = await prisma.camper.findMany({
          where: {
            name: {
              contains: name,
            },
            NOT: {
              name: req.user?.name,
            }
          },
          select: {
            id: true,
            name: true,
            Camp: true,
            ProfileImage: {
              select: {
                url: true,
              },
            },
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
            ProfileImage: {
              select: {
                url: true,
              },
            },
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
  }
);

export default router;
