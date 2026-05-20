import type {Permission} from "./RoleTypes.ts";

export interface FrontendRouteData{
    path: string;
    description?: string;
    permissions: Permission[];
}
export interface FrontendRoute{
    id: number;
    path: string;
    description?: string;
    permissions: Permission[];
}
