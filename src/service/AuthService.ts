import axios from "axios";
import { AUTH_URL, API_OAUTH2_ROUTES } from "../Consts.ts";

export interface OAuth2TokenResponse {
    access_token: string;
    refresh_token: string;
    scope: string;
    id_token: string;
    token_type: string;
    expires_in: number;
}

export class AuthService {
    private static readonly CLIENT_ID = "admin-frontend"; // Atualizado conforme application.yml
    private static readonly CLIENT_SECRET = "secret-admin"; // Atualizado conforme application.yml
    private static readonly REDIRECT_URI = window.location.origin + "/authorized"; // Atualizado conforme application.yml

    static getLoginUrl(): string {
        const params = new URLSearchParams();
        params.append('response_type', 'code');
        params.append('client_id', this.CLIENT_ID);
        params.append('redirect_uri', this.REDIRECT_URI);
        params.append('scope', 'openid read_profile'); // Atualizado conforme application.yml
        // params.append('state', 'some_random_state'); // Recomendado para segurança contra CSRF

        return `${API_OAUTH2_ROUTES}/authorize?${params.toString()}`;
    }

    static async handleCallback(code: string): Promise<boolean> {
        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'authorization_code');
            params.append('code', code);
            params.append('redirect_uri', this.REDIRECT_URI);
            // params.append('client_id', this.CLIENT_ID); // Authorization Code Flow com Basic Auth no header não precisa disso no body se usar header
            // params.append('client_secret', this.CLIENT_SECRET);

            // Basic Auth header com client_id e client_secret
            const authHeader = 'Basic ' + btoa(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`);

            const response = await axios.post<OAuth2TokenResponse>(
                `${API_OAUTH2_ROUTES}/token`,
                params,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': authHeader
                    }
                }
            );

            if (response.data && response.data.access_token) {
                this.saveTokens(response.data);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Callback handling failed", error);
            return false;
        }
    }

    static async login(username: string, password: string): Promise<boolean> {
        // Este método era para Resource Owner Password Credentials Grant, que é desencorajado.
        // Com Authorization Code Flow, o login acontece no Auth Server.
        // Mantendo apenas para compatibilidade se necessário, mas o ideal é usar getLoginUrl()
        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'password');
            params.append('username', username);
            params.append('password', password);
            params.append('scope', 'openid read_profile');

            const authHeader = 'Basic ' + btoa(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`);

            const response = await axios.post<OAuth2TokenResponse>(
                `${API_OAUTH2_ROUTES}/token`,
                params,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': authHeader
                    }
                }
            );

            if (response.data && response.data.access_token) {
                this.saveTokens(response.data);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    }

    static async refreshToken(): Promise<boolean> {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) return false;

        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'refresh_token');
            params.append('refresh_token', refreshToken);
            // params.append('client_id', this.CLIENT_ID);
            // params.append('client_secret', this.CLIENT_SECRET);

            const authHeader = 'Basic ' + btoa(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`);

            const response = await axios.post<OAuth2TokenResponse>(
                `${API_OAUTH2_ROUTES}/token`,
                params,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': authHeader
                    }
                }
            );

            if (response.data && response.data.access_token) {
                this.saveTokens(response.data);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Refresh token failed", error);
            this.logout();
            return false;
        }
    }

    static logout(): void {
        this.clearTokens();
        // Redireciona para o logout do Auth Server para invalidar a sessão
        window.location.href = `${AUTH_URL}/logout?redirect_uri=${window.location.origin}`;
    }

    static getAccessToken(): string | null {
        return localStorage.getItem("accessToken");
    }

    static isAuthenticated(): boolean {
        const token = this.getAccessToken();
        console.log(token)
        if (!token) return false;

        const expiresAt = localStorage.getItem("expiresAt");
        if (expiresAt && Date.now() > parseInt(expiresAt)) {
            return false;
        }
        return true;
    }

    private static saveTokens(response: OAuth2TokenResponse): void {
        localStorage.setItem("accessToken", response.access_token);
        if (response.refresh_token) {
            localStorage.setItem("refreshToken", response.refresh_token);
        }

        const expiresAt = Date.now() + (response.expires_in * 1000);
        localStorage.setItem("expiresAt", expiresAt.toString());
    }

    private static clearTokens(): void {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("expiresAt");
        localStorage.removeItem("user");
    }
}