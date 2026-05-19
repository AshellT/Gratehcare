import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request & { requestId?: string; tenantId?: string }, _res: Response, next: NextFunction) {
    req.requestId = (req.headers["x-request-id"] as string) || randomUUID();
    req.tenantId = req.headers["x-tenant-id"] as string | undefined;
    next();
  }
}
