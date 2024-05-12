import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Authorization } from "./authorization/Authorization";
import * as productsRoute from "./routes/products";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const app: Express = express();
const port = process.env.PORT || 3000;

new Authorization(
  process.env.AUTH0_ISSUER as string,
  process.env.API_AUDIENCE as string
);

app.use(productsRoute.default);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/401", (req: Request, res: Response) => {
  res.status(401).json({ name: "Unauthorized" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
