import { Router, Response } from "express";
import { Upload } from "@aws-sdk/lib-storage";
import prisma from "../../libs/prisma";
import { CamperLoginRequest } from "../../libs/types/CamperLoginRequest";
import isAdminLogin from "../../libs/middlewares/isAdminLogin";
import { S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import multer from "multer";

const storage = multer.memoryStorage();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESSKEY || '',
    secretAccessKey: process.env.AWS_SECRETACCESSKEY || '',
    sessionToken:
      process.env.AWS_SESSIONTOKEN || ''
  },
});

const router = Router();

router.post(
  "/:id",
  isAdminLogin,
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
      const camper = await prisma.camper.findUnique({
        where: {
          id: parseInt(req.params.id),
        },
      });
      if (!camper) {
        return res.status(404).send({
          message: "Camper not found",
        });
      }
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
    } catch (err) {
      return res.status(500).send({
        message: "Error uploading file",
      });
    }
  }
);

export default router;
