import type { Response } from "express";

export const success = <T>(res: Response, data: T, statusCode: number = 200): Response => {
  return res.status(statusCode).json(data);
};

export const created = <T>(res: Response, data: T): Response => {
  return res.status(201).json(data);
};

export const noContent = (res: Response): Response => {
  return res.status(204).send();
};
