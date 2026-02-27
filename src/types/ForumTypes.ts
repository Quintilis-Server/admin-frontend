import type {UserSummaryDTO} from "./User.ts";
import type {Permission} from "./RoleTypes.ts";

export interface Category {
    id: string
    title: string
    slug: string
    description: string
    display_order: number
    created_at: Date
    topics: Topic[]
    permissions: Permission[]
}
export interface Topic {
    id: string
    title: string
    slug: string
    content: string
    views: number
    createdAt: string
    author: UserSummaryDTO
}