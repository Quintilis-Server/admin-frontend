export interface Permission {
    id: number;
    name: string;
    description: string;
}

export interface Role {
    id: number;
    name: string;
    displayName: string;
    color: string;
    icon: string;
    priority: number;
    createdAt: string;
    permissions: string[];
}

export interface UserWithRoles {
    id: string;
    username: string;
    email: string;
    roles: Role[];
    avatarPath?: string;
    isVerified: boolean;
    createdAt?: string;
}
