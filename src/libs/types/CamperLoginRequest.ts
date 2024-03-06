import { Request } from "express";

export interface CamperLoginRequest extends Request {
  user?: any;
}
