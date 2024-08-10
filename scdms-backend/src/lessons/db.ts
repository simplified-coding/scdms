import { courseFetchIDBySlug } from "../courses/db.js";
import { LessonDocument } from "../documents.js";
import pb from "../pocketbase.js";

export const lessonExists = async (course: string, slug: string): Promise<boolean> => {
    return pb.collection("sc_lessons")
        .getFirstListItem<LessonDocument>(`(slug='${slug}) && (course='${course}')'`, { requestKey: null })
        .then(() => true).catch(() => false)
};

export const lessonFetchByCourse = async (course: string, page: number = 1): Promise<any> => {
    const courseID: string = await courseFetchIDBySlug(course);
    return pb.collection("sc_lessons")
        .getList(page, 30, { filter: `course='${courseID}'` })
        .then((data) => data.items).catch(() => null)
}

export const lessonInsert = async (course: any): Promise<LessonDocument> => {
    return await pb.collection("sc_lessons").create(course, { requestKey: null });
};
