import type { NextFunction, Request, RequestHandler, Response } from "express";

// Express 4 does not look at the promise an async route handler returns, so an
// error thrown inside one would otherwise go unhandled: the request hangs and
// Node may exit. This forwards it to Express, which answers with a 500.
export const asyncHandler =
  (
    handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
  ): RequestHandler =>
  (req, res, next) => {
    handler(req, res, next).catch(next);
  };
