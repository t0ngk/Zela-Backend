import { Router, Response, Request } from "express";
import { Upload } from "@aws-sdk/lib-storage";
import isCamperLogin from "../../libs/middlewares/isCamperLogin";
import prisma from "../../libs/prisma";
import { CamperLoginRequest } from "../../libs/types/CamperLoginRequest";
import { S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import multer from "multer";

const storage = multer.memoryStorage();

const router = Router();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESSKEY || '',
    secretAccessKey: process.env.AWS_SECRETACCESSKEY || '',
    sessionToken:
      process.env.AWS_SESSIONTOKEN || ''
  },
});

router.post(
  "/profile",
  isCamperLogin,
  multer({ storage }).single("profile"),
  async (req: CamperLoginRequest, res: Response) => {
    if (req.file === undefined) {
      return res.status(400).send({
        message: "File is required",
      });
    }

    try {
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: "project-bk1",
          Key: `${req.file.fieldname}-${Date.now()}.${req.file.originalname
            .split(".")
            .pop()}`,
          Body: Readable.from(req.file.buffer),
          ACL: "public-read",
          ContentType: req.file.mimetype,
        },
      });
      const response = await upload.done();
      const camper = req.user;
      const profileImage = await prisma.profileImage.create({
        data: {
          url: response.Location,
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
        path: profileImage.url,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        message: "Error uploading file",
      });
    }
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
        },
      },
    },
  });
  res.send(campers);
});

export default router;
