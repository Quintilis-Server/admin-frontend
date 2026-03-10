import axios from "axios";
import {AUTH_URL, API_OAUTH2_ROUTES} from "../Consts.ts";
import TokenWorker from './TokenWorker.ts?worker';

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

    private static processingCodes = new Set<string>();

    private static tokenWorker: Worker | null = null;

    static initWorker(): void {
        if (this.tokenWorker) return; // Evita criar dois Workers no React Strict Mode

        // 🔥 TROQUE A INSTANCIAÇÃO POR ESTA LINHA AQUI:
        this.tokenWorker = new TokenWorker();

        this.tokenWorker.postMessage({
            type: 'INIT',
            payload: {
                AUTH_URL: AUTH_URL,
                CLIENT_ID: this.CLIENT_ID,
                CLIENT_SECRET: this.CLIENT_SECRET,
                API_OAUTH2_ROUTES: API_OAUTH2_ROUTES
            }
        });

        // 2. Fica escutando os pedidos do Worker
        this.tokenWorker.onmessage = (event: MessageEvent) => {
            const { type, payload } = event.data;

            switch (type) {
                // O Worker está pedindo os dados atuais do localStorage
                case 'CHECK_STORAGE':
                    this.tokenWorker?.postMessage({
                        type: 'STORAGE_DATA',
                        payload: {
                            refreshToken: localStorage.getItem("refreshToken"),
                            expiresAt: localStorage.getItem("expiresAt")
                        }
                    });
                    break;

                // O Worker conseguiu um token novo! Vamos salvar.
                case 'TOKENS_REFRESHED':
                    this.saveTokens(payload);
                    console.log("✅ [AuthService] Tokens atualizados silenciosamente pelo Worker!");
                    break;

                // O Worker desistiu ou o refresh token expirou
                case 'SESSION_EXPIRED':
                case 'LOGOUT_REQUIRED':
                    console.warn("⚠️ [AuthService] Sessão expirada detectada pelo Worker. Limpando dados.");
                    this.clearSession();
                    // Opcional: você pode forçar um redirecionamento pra login aqui se quiser
                    // window.location.href = "/login";
                    break;
            }
        };
    }

    // 🔥 ADICIONE ESTE MÉTODO: Para desligar o Worker se precisar
    static stopWorker(): void {
        if (this.tokenWorker) {
            this.tokenWorker.postMessage({ type: 'STOP' });
            this.tokenWorker.terminate();
            this.tokenWorker = null;
        }
    }

    static getLoginUrl(returnTo?: string): string {
        const params = new URLSearchParams();
        params.append('response_type', 'code');
        params.append('client_id', this.CLIENT_ID);
        params.append('redirect_uri', this.REDIRECT_URI);
        params.append('scope', 'openid read_profile offline_access'); // Atualizado conforme application.yml
        if (returnTo) {
            params.append('state', returnTo);
        }

        return `${API_OAUTH2_ROUTES}/authorize?${params.toString()}`;
    }

    static async handleCallback(code: string): Promise<boolean> {
        if (this.processingCodes.has(code)) {
            console.log("🔥 IGNORANDO REQUISIÇÃO DUPLICADA DO REACT STRICT MODE!");
            return false;
        }
        this.processingCodes.add(code);
        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'authorization_code');
            params.append('code', code);
            params.append('redirect_uri', this.REDIRECT_URI);

            const authHeader = 'Basic ' + btoa(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`);

            const response = await axios.post<OAuth2TokenResponse>(
                `${API_OAUTH2_ROUTES}/token`,
                params.toString(), // <--- MUDE AQUI! Adicione .toString()
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': authHeader
                    }
                }
            );
            console.log("🔥 STATUS DA RESPOSTA:", response.status);
            console.log("🔥 DADOS DA RESPOSTA:", response.data);

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

    /**
     * Tenta fazer refresh do token silenciosamente, sem redirecionar.
     * Retorna true se conseguiu renovar, false caso contrário.
     */
    static async silentRefresh(): Promise<boolean> {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) return false;

        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'refresh_token');
            params.append('refresh_token', refreshToken);

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
            console.error("Silent refresh failed", error);
            return false;
        }
    }

    /**
     * Limpa a sessão local sem redirecionar.
     * Usado quando a sessão expira silenciosamente.
     */
    static clearSession(): void {
        this.clearTokens();
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
        // console.log(token)
        if (!token) return false;

        const expiresAt = localStorage.getItem("expiresAt");
        if (!expiresAt || Date.now() > parseInt(expiresAt)) {
            return false;
        }
        return true;
    }

    static isTokenExpiringSoon(): boolean {
        const expiresAt = localStorage.getItem("expiresAt");
        if (!expiresAt) return true;

        // Verifica se expira em menos de 2 minutos (120000 ms)
        return parseInt(expiresAt) - Date.now() < 120000;
    }

    static saveTokens(response: OAuth2TokenResponse): void {
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

// Global Axios Interceptor to add Bearer token to requests
axios.interceptors.request.use(config => {
    const token = AuthService.getAccessToken();
    if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: auto-refresh on 401 and retry
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown | null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(undefined);
        }
    });
    failedQueue = [];
};

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (originalRequest.url?.includes('/oauth2/token')) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => {
                originalRequest.headers.Authorization = `Bearer ${AuthService.getAccessToken()}`;
                return axios(originalRequest);
            });
        }

        isRefreshing = true;

        try {
            const success = await AuthService.silentRefresh();
            if (success) {
                processQueue(null);
                originalRequest.headers.Authorization = `Bearer ${AuthService.getAccessToken()}`;
                return axios(originalRequest);
            } else {
                processQueue(error);
                return Promise.reject(error);
            }
        } catch (refreshError) {
            processQueue(refreshError);
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);