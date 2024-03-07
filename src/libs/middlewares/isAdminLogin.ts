import { Response, NextFunction } from "express";
import prisma from "../prisma";
import jwt from "jsonwebtoken";
import { AdminLoginRequest } from "../types/AdminLoginRequest";

const isAdminLogin = async (
  req: AdminLoginRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send({
      message: "Unauthorized"
    });
  }

  try {
    const payload = jwt.verify(token, process.env.SERCET_KEY!);
    const admin = await prisma.user.findUnique({
      where: {
        id: (payload as any).id,
      },
      select: {
        id: true,
        username: true,
      },
    });
    if (!admin) {
      return res.status(404).send({
        message: "Admin not found"
      });
    }
    req.user = admin;
    next();
  } catch (error) {
    return res.status(401).send({
      message: "Unauthorized"
    });
  }
};

export default isAdminLogin;
