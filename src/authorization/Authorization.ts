import jwksClient, { SigningKey, JwksClient } from "jwks-rsa";
import { Request, Response, NextFunction } from "express";

import jwt, { JwtPayload } from "jsonwebtoken";

export class Authorization {
  static client: JwksClient;
  static issuer: string;
  static audience: string;

  constructor(issuer: string, audience: string) {
    Authorization.issuer = issuer;
    Authorization.audience = audience;
    Authorization.client = jwksClient({
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600000,
      jwksUri: `${issuer}.well-known/jwks.json`,
    });
  }

  static authorize = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (token == null) return res.redirect("/401");

    const decodedToken = jwt.decode(token, { complete: true, json: true });

    if (decodedToken == null) {
      return res.redirect("/401");
    }

    const kid = decodedToken.header.kid;

    if (kid == null) {
      return res.redirect("/401");
    }

    let signingKey: SigningKey;

    try {
      signingKey = await Authorization.client.getSigningKey(kid);
    } catch (e: unknown) {
      return res.redirect("/401");
    }

    const publicKey = signingKey.getPublicKey();

    let payload: JwtPayload | null;

    try {
      payload = jwt.verify(token, publicKey, {
        issuer: process.env.AUTH0_ISSUER,
        audience: process.env.API_AUDIENCE,
      }) as JwtPayload | null;
    } catch (e: unknown) {
      return res.redirect("/401");
    }

    req.roles = payload?.[`${Authorization.audience}/roles`] ?? [];

    return next();
  };

  static isAdmin = (roles?: string[]) => {
    return roles?.includes("admin");
  };
}
