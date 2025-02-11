import express, { Express, Request, Response } from "express";
import { Authorization } from "./authorization/Authorization";
import * as usersRoute from "./routes/users";
import { prisma } from "./db/prismaClient";

const app: Express = express();
const port = process.env.PORT || 3000;

new Authorization(
  process.env.AUTH0_ISSUER as string,
  process.env.API_AUDIENCE as string,
  process.env.AUTH0_WEBHOOK_TOKEN as string
);

const main = async () => {
  app.use(express.json());

  app.use(usersRoute.default);

  app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
  });

  app.get("/401", (req: Request, res: Response) => {
    res.status(401).json({ name: "Unauthorized" });
  });

  app.get("/404", (req: Request, res: Response) => {
    res.status(404).json({ name: "Page not found" });
  });

  app.use((req: Request, res: Response) => {
    res.redirect("/404");
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
