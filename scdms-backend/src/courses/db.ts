import { CourseDocument } from "../documents.js";
import pb from "../pocketbase.js";

export const courseExists = async (slug: string): Promise<boolean> => {
    return pb.collection("sc_courses")
        .getFirstListItem<CourseDocument>(`slug='${slug}'`, { requestKey: null })
        .then(() => true).catch(() => false)
};

export const courseInsert = async (course: CourseDocument): Promise<CourseDocument> => {
    return await pb.collection("sc_courses").create(course, { requestKey: null });
};

export const courseFetchIDBySlug = async (slug: string): Promise<null | string> => {
    return await pb.collection("sc_courses")
        .getFirstListItem<CourseDocument>(`slug='${slug}'`, { fields: "id" })
        .then((val) => val.id).catch(() => null)
}