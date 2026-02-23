import type { BaseState } from "../types/PageTypes.ts";
import type { User } from "../types/User.ts";
import { createContext, type ReactNode } from "react";
import { BaseComponent } from "../components/BaseComponent.tsx";
import { AuthService } from "../service/AuthService.ts";
import { jwtDecode } from "jwt-decode";

export interface UserContextProps {
    isLoggedIn: boolean
    isAdmin: boolean,
    sessionExpired: boolean,
    user?: User,
    loading: boolean,
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    revalidate: () => void;
}

type UserContextState = BaseState & {
    isLoggedIn: boolean
    isAdmin: boolean,
    sessionExpired: boolean,
    user?: User
}

export const UserContext = createContext<UserContextProps>({
    isLoggedIn: false,
    isAdmin: false,
    sessionExpired: false,
    user: undefined,
    loading: true,
    login: async () => { },
    logout: () => { },
    revalidate: () => { },
})

export class UserProvider extends BaseComponent<{ children: ReactNode }, UserContextState> {
    state: UserContextState = {
        isLoggedIn: false,
        isAdmin: false,
        sessionExpired: false,
        user: undefined,
        loading: true
    }

    private worker: Worker | null = null;

    componentDidMount() {
        this.checkLoginStatus();
        this.startTokenRefreshWorker();
    }

    componentWillUnmount() {
        if (this.worker) {
            this.worker.postMessage({ type: 'STOP' });
            this.worker.terminate();
        }
    }

    private startTokenRefreshWorker() {
        // Inicializa o Web Worker para rodar na background thread
        this.worker = new Worker(new URL('../service/TokenWorker.ts', import.meta.url), { type: 'module' });

        this.worker.onmessage = (event: MessageEvent) => {
            const { type, payload } = event.data;

            if (type === 'CHECK_STORAGE') {
                // Worker precisa ler o localStorage
                const refreshToken = localStorage.getItem("refreshToken");
                const expiresAt = localStorage.getItem("expiresAt");
                this.worker?.postMessage({
                    type: 'STORAGE_DATA',
                    payload: { refreshToken, expiresAt }
                });
            } else if (type === 'TOKENS_REFRESHED') {
                // Worker conseguiu dar refresh, salvamos os tokens e atualizamos o estado
                AuthService.saveTokens(payload);
                this.updateUserFromToken();
            } else if (type === 'LOGOUT_REQUIRED') {
                // Worker falhou em todas as tentativas de refresh
                // Tenta um último refresh silencioso antes de marcar sessão como expirada
                this.handleSilentLogout();
            } else if (type === 'SESSION_EXPIRED') {
                // Refresh token é inválido (invalid_grant)
                this.handleSessionExpired();
            }
        };

        // Envia as configurações para o Worker começar a trabalhar
        this.worker.postMessage({
            type: 'INIT',
            payload: {
                AUTH_URL: import.meta.env.VITE_AUTH_URL || "http://localhost:9000",
                CLIENT_ID: "admin-frontend",
                CLIENT_SECRET: "secret-admin",
                API_OAUTH2_ROUTES: import.meta.env.VITE_AUTH_URL ? `${import.meta.env.VITE_AUTH_URL}/oauth2` : "http://localhost:9000/oauth2"
            }
        });
    }

    /**
     * Tenta um último refresh silencioso. Se falhar, marca a sessão como expirada
     * SEM redirecionar — o usuário continua na página e vê um modal.
     */
    private handleSilentLogout = async () => {
        const success = await AuthService.silentRefresh();
        if (success) {
            console.log("[UserContext] Silent refresh succeeded after worker failure");
            this.updateUserFromToken();
        } else {
            console.log("[UserContext] Session expired, showing expiry modal");
            AuthService.clearSession();
            this.setState({
                isLoggedIn: false,
                isAdmin: false,
                sessionExpired: true,
                user: undefined
            });
        }
    }

    /**
     * Marca a sessão como expirada direto sem tentar refresh silencioso (ex: invalid_grant)
     */
    private handleSessionExpired = () => {
        console.log("[UserContext] Session definitely expired (invalid_grant), showing expiry modal");
        AuthService.clearSession();
        this.setState({
            isLoggedIn: false,
            isAdmin: false,
            sessionExpired: true,
            user: undefined
        });
    }

    /**
     * Atualiza o estado do usuário a partir do token no localStorage.
     */
    private updateUserFromToken() {
        const token = AuthService.getAccessToken();
        if (!token) return;

        try {
            const decoded: any = jwtDecode(token);
            const roles = decoded.roles || [];
            const isAdmin = roles.includes('ADMIN');

            const user: User = {
                id: decoded.user_id || decoded.sub,
                username: decoded.username || decoded.preferred_username,
                role: isAdmin ? 'ADMIN' : 'USER',
                avatarPath: decoded.avatar_path || undefined,
                isVerified: decoded.email_verified || false
            };

            this.setState({
                isLoggedIn: true,
                user: user,
                isAdmin: isAdmin,
                sessionExpired: false,
                loading: false
            });
        } catch (e) {
            console.error("Erro ao decodificar token", e);
        }
    }

    /**
     * Permite re-validar a sessão (ex: depois de fazer login em outra aba).
     */
    private revalidate = () => {
        this.setState({ loading: true, sessionExpired: false });
        this.checkLoginStatus();
    }

    private checkLoginStatus = async () => {
        // Verifica se há um código de autorização na URL (callback do OAuth2)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state') || "/";

        if (code) {
            this.setState({ loading: true });
            const success = await AuthService.handleCallback(code);
            if (success) {
                // Ao invés de usar replaceState e continuar no mesmo fluxo, 
                // redirecionamos limpo para a url original (state) ou /, 
                // assim o React reinicia limpo e não redireciona novamente
                window.location.href = state;
                return; // Pausa a renderização aqui
            } else {
                console.error("Falha ao processar callback de login");
            }
        }

        const isAuthenticated = AuthService.isAuthenticated();
        if (isAuthenticated) {
            this.updateUserFromToken();
        } else {
            this.setState({ isLoggedIn: false, loading: false });
        }
    }

    private login = async () => {
        // Redireciona para o login do OAuth2
        window.location.href = AuthService.getLoginUrl();
    }

    private logout = () => {
        AuthService.logout();
        this.setState({
            isLoggedIn: false,
            isAdmin: false,
            sessionExpired: false,
            user: undefined
        });
    }

    render() {
        return (
            <UserContext.Provider value={{
                isLoggedIn: this.state.isLoggedIn,
                isAdmin: this.state.isAdmin,
                sessionExpired: this.state.sessionExpired,
                user: this.state.user,
                loading: this.state.loading,
                login: this.login,
                logout: this.logout,
                revalidate: this.revalidate
            }}>
                {this.props.children}
            </UserContext.Provider>
        );
    }
}