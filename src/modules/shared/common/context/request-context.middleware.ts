import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import { requestContext } from './request-context';
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(_req: Request, _res: Response, next: NextFunction): void {
    // Opens a fresh "box" for this request only, before guards/handlers
    // run. Everything downstream in this same async chain can read it.
    requestContext.run({ requestId: randomUUID() }, () => next());
  }
}
