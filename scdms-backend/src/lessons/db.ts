import { LessonDocument } from "../documents.js";
import pb from "../pocketbase.js";

export const lessonExists = async (course: string, slug: string): Promise<boolean> => {
    return pb.collection("sc_lessons")
        .getFirstListItem<LessonDocument>(`(slug='${slug}) && (course='${course}')'`, { requestKey: null })
        .then(() => true).catch(() => false)
};

export const lessonInsert = async (course: any): Promise<LessonDocument> => {
    return await pb.collection("sc_lessons").create(course, { requestKey: null });
};
