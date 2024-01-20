import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ status: true, message: "SCDMS - Certificates API" });
});

router.post("/generate", async (req: Request, res: Response) => {
  if (!(req.body.fullname && req.body.email && req.body.course)) {
    res.status(422).json({
      status: false,
      msg: "Some fields were not found!",
    });

    return;
  }
});

export default router;
