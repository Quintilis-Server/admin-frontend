import type { BaseState } from "../types/PageTypes.ts";
import type { User } from "../types/User.ts";
import { createContext, type ReactNode } from "react";
import { BaseComponent } from "../components/BaseComponent.tsx";
import { AuthService } from "../service/AuthService.ts";
import { jwtDecode } from "jwt-decode";

export interface UserContextProps {
    isLoggedIn: boolean
    isAdmin: boolean,
    user?: User,
    loading: boolean,
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

type UserContextState = BaseState & {
    isLoggedIn: boolean
    isAdmin: boolean,
    user?: User
}

export const UserContext = createContext<UserContextProps>({
    isLoggedIn: false,
    isAdmin: false,
    user: undefined,
    loading: true,
    login: async () => { },
    logout: () => { },
})

export class UserProvider extends BaseComponent<{ children: ReactNode }, UserContextState> {
    state: UserContextState = {
        isLoggedIn: false,
        isAdmin: false,
        user: undefined,
        loading: true
    }

    componentDidMount() {
        this.checkLoginStatus();
    }

    private checkLoginStatus = async () => {
        // Verifica se há um código de autorização na URL (callback do OAuth2)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            this.setState({ loading: true });
            const success = await AuthService.handleCallback(code);
            if (success) {
                // Ao invés de usar replaceState e continuar no mesmo fluxo, 
                // redirecionamos limpo pro /, assim o React reinicia limpo e não redireciona novamente
                window.location.href = "/";
                return; // Pausa a renderização aqui
            } else {
                console.error("Falha ao processar callback de login");
            }
        }

        const isAuthenticated = AuthService.isAuthenticated();
        if (isAuthenticated) {
            const token = AuthService.getAccessToken();
            if (token) {
                try {
                    const decoded: any = jwtDecode(token);
                    // Ajuste conforme o payload do seu token JWT
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
                        loading: false
                    });
                } catch (e) {
                    console.error("Erro ao decodificar token", e);
                    this.setState({ isLoggedIn: false, loading: false });
                }
            }
        } else {
            this.setState({ isLoggedIn: false, loading: false });
            // window.location.href = AuthService.getLoginUrl();
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
            user: undefined
        });
    }

    render() {
        return (
            <UserContext.Provider value={{
                isLoggedIn: this.state.isLoggedIn,
                isAdmin: this.state.isAdmin,
                user: this.state.user,
                loading: this.state.loading,
                login: this.login,
                logout: this.logout
            }}>
                {this.props.children}
            </UserContext.Provider>
        );
    }
}