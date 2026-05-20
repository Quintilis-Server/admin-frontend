import type {Permission} from "./RoleTypes.ts";

export interface FrontendRouteData{
    path: string;
    description?: string;
    permissions: Permission[];
}
export interface FrontendRoute{
    id: string;
    path: string;
    description?: string;
    permissions: Permission[];
}
