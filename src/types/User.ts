export interface User {
    id: string;
    username: string;
    roles: string[];
    permissions: string[];
    avatarPath?: string;
    isVerified: boolean;
}
export interface UserSummaryDTO {
    id: string
    username: string
    roles: string[]
    permissions: string[]
    avatarPath: string | null
    isVerified: boolean
}