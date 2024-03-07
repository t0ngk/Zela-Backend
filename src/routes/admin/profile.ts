import { Router, Response } from "express";
import upload from "../../libs/upload";
import prisma from "../../libs/prisma";
import { CamperLoginRequest } from "../../libs/types/CamperLoginRequest";
import isAdminLogin from "../../libs/middlewares/isAdminLogin";

const router = Router();

router.post(
  "/:id",
  isAdminLogin,
  upload.single("profile"),
  async (req: CamperLoginRequest, res: Response) => {
    if (req.file === undefined) {
      return res.status(400).send("File is required");
    }
    const path = req.file.path;
    const camper = await prisma.camper.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });
    if (!camper) {
      return res.status(404).send("Camper not found");
    }
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

export default router;
