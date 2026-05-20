import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';

interface RequirePermissionProps {
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
    permission,
    permissions,
    requireAll = false,
    fallback = null,
    children
}) => {
    const { hasPermission, hasAnyPermission, user } = useContext(UserContext);

    // Se não tiver usuário logado, não renderiza
    if (!user) {
        return <>{fallback}</>;
    }

    // Opcional: Se for ADMIN, pode pular a verificação dependendo da sua regra de negócio
    // if (isAdmin) return <>{children}</>;

    let hasAccess = false;

    if (permission) {
        hasAccess = hasPermission(permission);
    } else if (permissions && permissions.length > 0) {
        if (requireAll) {
            hasAccess = permissions.every(p => hasPermission(p));
        } else {
            hasAccess = hasAnyPermission(permissions);
        }
    } else {
        // Se nenhuma permissão foi exigida, permite o acesso
        hasAccess = true;
    }

    return hasAccess ? <>{children}</> : <>{fallback}</>;
};
