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