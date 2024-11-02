import express, { Request, Response } from "express";
import { Authorization } from "../authorization/Authorization";
import { prisma } from "../db/prismaClient";
import { getPagination } from "../common/utils";

const router = express.Router();

router.get(
  "/get-users",
  Authorization.authorize,
  async (req: Request, res: Response) => {
    const { page } = req.query;

    if (!Authorization.isAdmin(req.userInfo?.roles)) {
      return res.redirect("/401");
    }

    const pagination = getPagination(page as string);

    const users = await prisma.user.findMany({ ...pagination });

    res.status(200).json({ users });
  }
);

router.get(
  "/get-user",
  Authorization.authorize,
  async (req: Request, res: Response) => {
    const queryId = req.query.oauthId as string;
    const { oauthId: tokenId, roles } = req.userInfo ?? {};

    if (!Authorization.hasUserAccess(roles, tokenId, queryId)) {
      return res.redirect("/401");
    }
    const user = await prisma.user.findUnique({ where: { oauthId: queryId } });

    res.status(200).json({ user });
  }
);

router.post(
  "/create-user",
  Authorization.canCreateUser,
  async (req: Request, res: Response) => {
    const { user_id: oauthId, email } = req.body.user;

    const user = await prisma.user.create({
      data: {
        firstname: "",
        lastname: "",
        email,
        oauthId,
      },
    });

    res.status(200).json({ user });
  }
);

export default router;
