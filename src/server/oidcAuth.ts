import { Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import { GCP_CONFIG, getAppUrl } from "./config";
import { logPushEvent } from "./logger";

const authClient = new OAuth2Client();

export async function verifyCloudTasksOidc(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_UNAUTH_TASKS === "true") {
      console.warn("[OIDC] Dev mode task bypass enabled via ALLOW_DEV_UNAUTH_TASKS");
      return next();
    }

    logPushEvent("OIDC_AUTH_FAIL", {
      message: "Missing or malformed Authorization header",
      statusCode: 401,
    });
    res.status(401).json({ error: "Unauthorized: Missing OIDC Bearer token" });
    return;
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const expectedAudience = getAppUrl();

    const ticket = await authClient.verifyIdToken({
      idToken,
      audience: expectedAudience,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      logPushEvent("OIDC_AUTH_FAIL", { message: "Empty token payload", statusCode: 403 });
      res.status(403).json({ error: "Forbidden: Empty token payload" });
      return;
    }

    const expectedEmail = GCP_CONFIG.taskInvokerServiceAccount.toLowerCase();
    const tokenEmail = (payload.email || "").toLowerCase();

    if (tokenEmail !== expectedEmail) {
      logPushEvent("OIDC_AUTH_FAIL", {
        message: `Service account mismatch. Got ${tokenEmail}, expected ${expectedEmail}`,
        statusCode: 403,
      });
      res.status(403).json({ error: "Forbidden: Unauthorized invoker identity" });
      return;
    }

    if (payload.email_verified === false) {
      logPushEvent("OIDC_AUTH_FAIL", { message: "Email not verified", statusCode: 403 });
      res.status(403).json({ error: "Forbidden: Email not verified" });
      return;
    }

    logPushEvent("OIDC_AUTH_OK", { invoker: tokenEmail, audience: payload.aud });
    next();
  } catch (err: any) {
    logPushEvent("OIDC_AUTH_FAIL", {
      message: err.message || "Token verification exception",
      statusCode: 401,
    });
    res.status(401).json({ error: `Unauthorized: ${err.message}` });
  }
}
