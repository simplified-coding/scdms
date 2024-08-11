import express, { Request, Response } from "express"
import passport from "passport";
import { fetchLessonHTML } from "../lessons/crawl.js";
import { lessonExists, lessonFetchByCourse, lessonInsert } from "../lessons/db.js";
import { courseFetchIDBySlug } from "../courses/db.js";
import pb from "../pocketbase.js";

const router = express.Router();

router.get("/:course", async (req: Request, res: Response) => {
    res.status(200).json(await lessonFetchByCourse(req.params.course))
})

router.post("/migrate", passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
        if (!req.user.ADMIN) return res.status(403);
        const { data } = req.body;

        if (!data || typeof data != "object")
            return res.status(400).json({ status: false, msg: "The data array in the body to migrate was not found." })

        const course = (await courseFetchIDBySlug(req.query.course as string))
        data.forEach(async (lesson: any) => {
            if (await lessonExists(course, lesson.slug)) return;

            const lessonHTML = await fetchLessonHTML(req.query.course as string, lesson.slug);
            lessonInsert({ data: lessonHTML, course: course, slug: lesson.slug, title: lesson.title, description: lesson.description })
        })

        res.status(200).json({ status: true })
    });

export default router;