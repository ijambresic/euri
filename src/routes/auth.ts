import express from "express";
import Cookies from "cookies";

export const router = express.Router();

const ADMIN_PASSWORD =
  "TRzmx4q56mz2VpCESd+tHH3vndrM/Qrq9T9PqwC5cnK8rMWr3uSYzicnn34NKqUd0Gpj95XDb48zYEVXeWAaQA==";

router.get("/", (req: express.Request, res: express.Response) => {
  res.render("adminHome");
});

router.post("/", (req: express.Request, res: express.Response) => {
  const { adminPassword } = req.body;

  if (adminPassword === undefined) return res.status(400).send("Bad request");

  if (adminPassword !== ADMIN_PASSWORD) return res.status(400).send("Bad request");

  res
    .cookie("administrativnaSifra", ADMIN_PASSWORD, {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 1, // 1 year
      httpOnly: true,
      sameSite: "strict",
    })
    .send("ok");
});

export function isAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const adminPasswordCookie = new Cookies(req, res).get("administrativnaSifra");

  if (adminPasswordCookie === undefined) return res.status(401).send("Unauthorized");

  if (decodeURIComponent(adminPasswordCookie) !== ADMIN_PASSWORD)
    return res.status(401).send("Unauthorized");

  next();
}
