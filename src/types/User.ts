export interface User {
    id: string;
    username: string;
    roles: string[];
    avatarPath?: string;
    isVerified: boolean;
}