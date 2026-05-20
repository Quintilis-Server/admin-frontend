import type {Permission} from "./RoleTypes.ts";

export interface FrontendRoute{
    id: number;
    path: string;
    description?: string;
    permissions: Permission[];
}
