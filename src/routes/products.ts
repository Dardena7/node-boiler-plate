import express, { Request, Response } from "express";
import { Authorization } from "../authorization/Authorization";

const router = express.Router();

router.get(
  "/products",
  Authorization.authorize,
  (req: Request, res: Response) => {
    if (!Authorization.isAdmin(req.roles)) res.redirect("/401");
    res.status(200).json({ name: "Product 1", price: 100 });
  }
);

export default router;
