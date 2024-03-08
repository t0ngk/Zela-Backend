import { Router, Response } from "express";
import prisma from "../../libs/prisma";
import isCamperLogin from "../../libs/middlewares/isCamperLogin";
import { CamperLoginRequest } from "../../libs/types/CamperLoginRequest";
import { z } from "zod";
const router = Router();

router.get(
  "/",
  isCamperLogin,
  async (req: CamperLoginRequest, res: Response) => {
    const camper = req.user;
    const messages = await prisma.message.findMany({
      where: {
        senderId: camper.id,
      },
      select: {
        content: true,
        createdAt: true,
        sender: {
          select: {
            name: true,
            zelaCode: true,
            Camp: true,
          },
        },
      },
    });
    res.send(messages);
  }
);

const messageSchema = z.object({
  message: z.string(),
});

router.post(
  "/sent/:id",
  isCamperLogin,
  async (req: CamperLoginRequest, res: Response) => {
    try {
      const data = messageSchema.parse(req.body);
      const receiverId = req.params.id;
      const senderId = req.user.id;
      if (receiverId === senderId) {
        return res.status(400).send({
          message: "You can't send message to yourself",
        });
      }
      const receiver = await prisma.camper.findUnique({
        where: {
          id: parseInt(receiverId),
        },
      });
      if (!receiver) {
        return res.status(404).send({
          message: "Receiver not found",
        });
      }
      await prisma.message.create({
        data: {
          content: data.message,
          sender: {
            connect: {
              id: senderId,
            },
          },
          receiver: {
            connect: {
              id: parseInt(receiverId),
            },
          },
        },
      });
      return res.status(200).send({
        message: "Message sent",
      });
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

export default router;
