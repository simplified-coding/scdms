import { courseFetchIDBySlug } from "../courses/db.js";
import { LessonDocument } from "../documents.js";
import pb from "../pocketbase.js";

export const lessonExists = async (course: string, slug: string): Promise<boolean> => {
    const index: number = Number(slug.replace("lesson_", ""))
    return pb.collection("sc_lessons")
        .getFirstListItem<LessonDocument>(`(index='${index}) && (course='${course}')'`, { requestKey: null })
        .then(() => true).catch(() => false)
};

export const lessonFetchByCourse = async (course: string, page: number = 1): Promise<any> => {
    return pb.collection("sc_lessons")
        .getList(page, 30, { filter: `course.slug='${course}' && draft=false`, sort: "+index" })
        .then((data) => data.items).catch(() => null)
}

export const lessonFetch = async (course: string, lesson: number = 1): Promise<any> => {

    return pb.collection("sc_lessons")
        .getFirstListItem(`course.slug='${course}' && index=${lesson}`)
        .then((data) => data).catch(() => null);
}

export const lessonInsert = async (course: any): Promise<LessonDocument> => {
    return await pb.collection("sc_lessons").create(course, { requestKey: null });
};
