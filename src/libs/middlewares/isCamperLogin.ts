import { Response, NextFunction } from "express";
import prisma from "../prisma";
import jwt from "jsonwebtoken";
import { CamperLoginRequest } from "../types/CamperLoginRequest";

const isCamperLogin = async (
  req: CamperLoginRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send({
      message: "Unauthorized",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.SERCET_KEY!);
    const camper = await prisma.camper.findUnique({
      where: {
        id: (payload as any).camperId,
      },
    });
    if (!camper) {
      return res.status(404).send({
        message: "Camper not found",
      });
    }
    req.user = camper;
    next();
  } catch (error) {
    return res.status(401).send({
      message: "Unauthorized",
    });
  }
};

export default isCamperLogin;
