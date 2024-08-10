import express, { Request, Response } from "express";
import passport from "passport";
import pb from "../pocketbase.js";
import { courseExists, courseFetchIDBySlug, courseInsert } from "../courses/db.js";

const router = express.Router();

router.post("/migrate", passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
        const { courses } = req.body;

        if (!courses || typeof courses !== "object")
            return res.status(400).json({ status: false, msg: "The courses array in the body to migrate was not found." })

        courses.forEach(async (course: any) => {
            if (!await courseExists(course.slug))
                await courseInsert(course)
        })

        res.status(200).json({ status: true })
    })

router.get("/:slug", async (req: Request, res: Response) => {
    const { slug } = req.params;

    res.status(200).json({ status: true, id: await courseFetchIDBySlug(slug) })
})

export default router;