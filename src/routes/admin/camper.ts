import { Router, Response } from "express";
import prisma from "../../libs/prisma";
import isAdminLogin from "../../libs/middlewares/isAdminLogin";
import { AdminLoginRequest } from "../../libs/types/AdminLoginRequest";
import { z } from "zod";

const router = Router();

const camperSchema = z.object({
  name: z.string(),
  zelaCode: z.string(),
  campId: z.number().nullable(),
});

router.post(
  "/",
  isAdminLogin,
  async (req: AdminLoginRequest, res: Response) => {
    try {
      const data = camperSchema.parse(req.body);
      if (data.campId !== null) {
        const camp = await prisma.camp.findUnique({
          where: {
            id: data.campId,
          },
        });
        if (!camp) {
          return res.status(404).send({
            message: "Camp not found",
          });
        }
      }
      const isCamperExist = await prisma.camper.findUnique({
        where: {
          zelaCode: data.zelaCode,
        },
      });
      if (isCamperExist) {
        return res.status(400).send({
          message: "Camper already exist",
        });
      }
      const camper = await prisma.camper.create({
        data: {
          name: data.name,
          zelaCode: data.zelaCode,
          campId: data.campId,
        },
      });
      return res.send(camper);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(error.errors);
        return res.status(400).send(
          error.errors.map((e) => {
            return {
              path: e.path,
              message: e.message,
            };
          })
        );
      }
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  }
);

router.put(
  "/:id",
  isAdminLogin,
  async (req: AdminLoginRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const data = camperSchema.parse(req.body);
      const camper = await prisma.camper.findUnique({
        where: {
          id,
        },
      });
      if (!camper) {
        return res.status(404).send({
          message: "Camper not found",
        });
      }
      if (data.campId !== null) {
        const camp = await prisma.camp.findUnique({
          where: {
            id: data.campId,
          },
        });
        if (!camp) {
          return res.status(404).send({
            message: "Camp not found",
          });
        }
      }
      const updatedCamper = await prisma.camper.update({
        where: {
          id,
        },
        data: {
          name: data.name,
          zelaCode: data.zelaCode,
          campId: data.campId,
        },
      });
      return res.send(updatedCamper);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(error.errors);
        return res.status(400).send(
          error.errors.map((e) => {
            return {
              path: e.path,
              message: e.message,
            };
          })
        );
      }
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  }
);

router.delete(
  "/:id",
  isAdminLogin,
  async (req: AdminLoginRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const camper = await prisma.camper.findUnique({
        where: {
          id,
        },
      });
      if (!camper) {
        return res.status(404).send({
          message: "Camper not found",
        });
      }
      await prisma.camper.delete({
        where: {
          id,
        },
      });
      return res.send("Camper deleted");
    } catch (error) {
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  }
);

export default router;
