import { Router, Request, Response } from "express";
import { z } from "zod";
import prisma from "../../libs/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import isAdminLogin from "../../libs/middlewares/isAdminLogin";
import { AdminLoginRequest } from "../../libs/types/AdminLoginRequest";

const router = Router();

const adminSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// GET /auth/admin
// Check is admin exists
router.get("/", async (_: Request, res: Response) => {
  const isFirstAdmin = await prisma.user.findFirst();
  if (!isFirstAdmin) {
    return res.send(true);
  }
  return res.send(false);
});

router.get("/me", isAdminLogin , async (req: AdminLoginRequest, res: Response) => {
  const admin = req.user;
  return res.send(admin);
});

// POST /auth/admin/login
// Login as admin if there is no admin create one
router.post("/login", async (req: Request, res: Response) => {
  const isFirstAdmin = await prisma.user.findFirst();
  try {
    if (!isFirstAdmin) {
      const { username, password } = adminSchema.parse(req.body);
      await prisma.user.create({
        data: {
          username,
          password: bcrypt.hashSync(password, 10),
        },
      });
      return res.send("Admin created");
    }
    const { username, password } = adminSchema.parse(req.body);
    const user = await prisma.user.findFirst({
      where: {
        username,
      },
    });
    if (!user) {
      return res.status(404).send("User not found");
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).send("Invalid password");
    }
    const token = jwt.sign({ id: user.id }, process.env.SERCET_KEY as string);
    return res.send({ token });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
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

export default router;
