import { RecordModel } from "pocketbase";

export interface AuthDocument extends RecordModel {
    iv: string,
    auth: string,
    data: string,
    hash: string
}

export interface UserDocument extends AuthDocument {
    admin: boolean
}

export interface CertDocument extends RecordModel {
    deactivated?: string
    fullname: string,
    course: string,
    status?: string,
    email: string,
    id: string
}

export interface CourseDocument extends RecordModel {
    slug: string,
    language: string,
    level: string,
    title: string,
    description: string,
    icon: string,
    viewOnly: boolean
}

export interface LessonDocument extends RecordModel {
    slug: string,
    title: string,
    description?: string,
    course: string,
    data: string
}