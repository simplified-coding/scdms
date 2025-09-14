import express, { Request, Response } from "express"
import passport from "passport";
import fs from "fs"
import { convert } from "html-to-text"
import escape from "escape-html";
import { fetchLessonHTML } from "../lessons/crawl.js";
import { lessonExists, lessonFetch, lessonFetchByCourse, lessonInsert } from "../lessons/db.js";
import { courseFetchIDBySlug } from "../courses/db.js";
import pb from "../pocketbase.js";

const router = express.Router();

const prismJS = fs.readFileSync(`./src/assets/prism.js`)
const prismCSS = fs.readFileSync(`./src/assets/prism.css`)
const tinyMCECSS = fs.readFileSync(`./src/assets/tinymce.css`)

router.get("/:course", async (req: Request, res: Response) => {
    res.status(200).json(await lessonFetchByCourse(req.params.course))
})

router.get("/:course/:lesson", async (req: Request, res: Response) => {
    const { course, lesson } = req.params;
    const dbLesson = await lessonFetch(course, Number(lesson) || 1);

    if (!dbLesson) return res.status(404).send(`<h1>No Lesson Found for ${escape(course)}/${escape(lesson)}</h1>`)

    if (req.query.raw == "true") return res.header("Content-Type", "text/plain; charset=utf-8").status(200).end(convert(dbLesson.data))

    dbLesson.data = dbLesson.data.replaceAll("language-markdown", "language-treeview")
    res.setHeader("Content-Type", "text/html")
    res.end(`<html><body class="match-braces rainbow-braces diff-highlight">${dbLesson.data}</body><style>${prismCSS}</style><style>${tinyMCECSS}</style><script defer>${prismJS}</script></html>`)
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