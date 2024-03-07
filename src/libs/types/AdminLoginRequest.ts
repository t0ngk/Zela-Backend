import { Request } from "express";

export interface AdminLoginRequest extends Request {
  user?: any;
}
