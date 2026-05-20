import React, { useContext, useMemo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { RouteContext } from '../context/RouteContext';
import { RequirePermission } from './RequirePermission';
import { UserContext } from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons';

// Função auxiliar simples para transformar um path do React Router (ex: /auth/users/:id) em uma RegExp
const pathToRegexp = (path: string) => {
    const pattern = path
        .replace(/\/:[^\s/]+/g, '/([^/]+)') // Substitui :id por regex que pega qualquer coisa entre barras
        .replace(/\*/g, '.*'); // Substitui wildcards *
    return new RegExp(`^${pattern}$`);
};

export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
    const location = useLocation();
    const { routes, loadingRoutes } = useContext(RouteContext);
    const { loading: loadingUser, logout, isLoggedIn } = useContext(UserContext);

    // Expõe o logout pro botão do fallback (hackzinho rápido pra não criar outro componente separado pro fallback)
    if (typeof window !== 'undefined') {
        (window as any)._userContextLogout = logout;
    }

    // Encontra TODAS as regras de rota que batem com o pathname atual
    const matchedRoutes = useMemo(() => {
        if (!routes || routes.length === 0) return [];
        
        // Pega todas as rotas que derem match no regex (hierarquia)
        return routes.filter(route => {
            const regex = pathToRegexp(route.path);
            return regex.test(location.pathname);
        });
    }, [location.pathname, routes]);

    // Se estiver carregando, mostra loading genérico
    if (loadingRoutes || loadingUser) {
        return <div>Carregando...</div>;
    }

    // Se o usuário não está logado, nós DEIXAMOS passar o componente (children).
    // O motivo é que o `BasePage` (que engloba todas as páginas) já tem a responsabilidade 
    // de verificar se há sessão e exibir o modal correto de "Sessão Expirada / Fazer Login".
    if (!isLoggedIn) {
        return <>{children}</>;
    }

    // Se não tem rota configurada no banco, vamos assumir que é pública (ou você pode bloquear se quiser)
    if (matchedRoutes.length === 0) {
        return <>{children}</>;
    }

    // Coleta as permissões de TODAS as rotas que deram match
    const aggregatedPermissions = new Set<string>();
    matchedRoutes.forEach(route => {
        if (route.permissions) {
            route.permissions.forEach(p => aggregatedPermissions.add(p.name));
        }
    });

    const permissionNames = Array.from(aggregatedPermissions);

    // Se nenhuma rota exigiu permissão, é pública
    if (permissionNames.length === 0) {
        return <>{children}</>;
    }

    return (
        <RequirePermission 
            permissions={permissionNames} 
            requireAll={true}
            fallback={
                <div className="session-expired-overlay">
                    <div className="session-expired-modal">
                        <div className="session-expired-icon"><FontAwesomeIcon icon={faBan}/></div>
                        <h2>Acesso Negado</h2>
                        <p>Você não tem permissão para acessar esta página.</p>
                        <div className="session-expired-actions">
                            <button 
                                onClick={() => window.location.href = '/'}
                                className="session-expired-btn session-expired-btn-primary"
                            >
                                Ir para Início
                            </button>
                            <button 
                                onClick={() => {
                                    const userCtx = (window as any)._userContextLogout;
                                    if (userCtx) userCtx();
                                }}
                                className="session-expired-btn session-expired-btn-secondary"
                            >
                                Trocar de Conta
                            </button>
                        </div>
                    </div>
                </div>
            }
        >
            {children}
        </RequirePermission>
    );
};
