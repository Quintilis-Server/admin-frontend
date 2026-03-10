import type {Permission} from "./RoleTypes.ts";

export interface RouteRule{
    id: string,
    httpMethod: string,
    urlPattern: string,
    serviceName: string,
    permissions: Permission[]
    description: string
}