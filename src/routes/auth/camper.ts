import { Router, Request, Response } from "express";
import { z } from "zod";
import prisma from "../../libs/prisma";
import jwt from "jsonwebtoken";

const router = Router();

const camperSchema = z.object({
  zelaCode: z.string(),
});

// POST /auth/camper/code
// Camper login
router.post("/code", async (req: Request, res: Response) => {
  try {
    const data = camperSchema.parse(req.body);
    const camper = await prisma.camper.findUnique({
      where: {
        zelaCode: data.zelaCode,
      },
    });
    if (camper) {
      const token = jwt.sign(
        {
          camperId: camper.id,
        },
        process.env.SERCET_KEY!
      );
      return res.status(200).send({
        token,
      });
    }
    return res.status(404).send({
      message: "Zela Code not found!",
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
    return res.status(500).send("Internal Server Error");
  }
});

// GET /auth/camper/me
// Get current camper
router.get("/me", async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  try {
    const payload = jwt.verify(token, process.env.SERCET_KEY!);
    const camper = await prisma.camper.findUnique({
      where: {
        id: (payload as any).camperId,
      },
      select: {
        name: true,
        zelaCode: true,
        ProfileImage: true,
        Camp: true,
      },
    });
    if (camper) {
      return res.status(200).send(camper);
    }
    return res.status(404).send("Camper not found");
  } catch (error) {
    return res.status(401).send("Unauthorized");
  }
});

export default router;
