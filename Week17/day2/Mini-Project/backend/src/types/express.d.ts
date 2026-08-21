/**
 * Adds `req.user` to Express's Request type.
 *
 * `authenticate` sets it after verifying the access token, so every downstream
 * handler can read `req.user.id` with full type safety instead of casting to `any`.
 */
import type { Story } from "@storyapp/types";

declare global {
  namespace Express {
    interface Request {
      /** Set by the `authenticate` middleware. Absent on unauthenticated routes. */
      user?: { id: number };
      /**
       * Set by the story authorization middleware, so the controller that runs next
       * does not have to fetch the same row a second time.
       */
      story?: Story;
    }
  }
}

export {};
