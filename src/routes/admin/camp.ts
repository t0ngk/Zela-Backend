import { Router, Response } from "express";
import prisma from "../../libs/prisma";
import isAdminLogin from "../../libs/middlewares/isAdminLogin";
import { AdminLoginRequest } from "../../libs/types/AdminLoginRequest";
import { z } from "zod";

const router = Router();

const campSchema = z.object({
  name: z.string(),
  color: z.string(),
});

router.post(
  "/",
  isAdminLogin,
  async (req: AdminLoginRequest, res: Response) => {
    try {
      const data = campSchema.parse(req.body);
      const camp = await prisma.camp.create({
        data: {
          name: data.name,
          color: data.color,
        },
      });
      return res.send(camp);
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
      return res.status(500).send("Internal Server Error");
    }
  }
);

router.put(
  "/:id",
  isAdminLogin,
  async (req: AdminLoginRequest, res: Response) => {
    try {
      const data = campSchema.parse(req.body);
      const camp = await prisma.camp.update({
        where: {
          id: parseInt(req.params.id),
        },
        data: {
          name: data.name,
          color: data.color,
        },
      });
      return res.send(camp);
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
      return res.status(500).send("Internal Server Error");
    }
  }
);

router.delete(
  "/:id",
  isAdminLogin,
  async (req: AdminLoginRequest, res: Response) => {
    try {
      const camp = await prisma.camp.findUnique({
        where: {
          id: parseInt(req.params.id),
        },
      });
      if (!camp) {
        return res.status(404).send("Camp not found");
      }
      await prisma.camp.delete({
        where: {
          id: parseInt(req.params.id),
        },
      });
      return res.send("Camp deleted");
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  }
);

export default router;
