import showdown from "showdown"

const converter = new showdown.Converter();

export const fetchLessonHTML = async (course: string, lesson: string): Promise<string> => {
    const raw = await fetch(`https://raw.githubusercontent.com/simplified-coding/simplified-coding/main/src/pages/lessons/${course}/${lesson}.mdx`)
        .then(data => data.text())

    return converter.makeHtml(raw)
}