import { Router, Response, Request } from "express";
import upload from "../../libs/upload";
import isCamperLogin from "../../libs/middlewares/isCamperLogin";
import prisma from "../../libs/prisma";
import { CamperLoginRequest } from "../../libs/types/CamperLoginRequest";

const router = Router();

router.post(
  "/profile",
  isCamperLogin,
  upload.single("profile"),
  async (req: CamperLoginRequest, res: Response) => {
    if (req.file === undefined) {
      return res.status(400).send({
        message: "File is required",
      });
    }
    const path = req.file.path;
    const camper = req.user;
    const profileImage = await prisma.profileImage.create({
      data: {
        url: path as string,
      },
    });
    await prisma.camper.update({
      where: {
        id: camper.id,
      },
      data: {
        ProfileImage: {
          connect: {
            id: profileImage.id,
          },
        },
      },
    });
    res.send({
      path: req.file?.path,
    });
  }
);

router.get("/", async (_: Request, res: Response) => {
  const campers = await prisma.camper.findMany({
    select: {
      id: true,
      name: true,
      Camp: true,
      ProfileImage: {
        select: {
          url: true,
        }
      },
    },
  });
  res.send(campers);
});

export default router;
