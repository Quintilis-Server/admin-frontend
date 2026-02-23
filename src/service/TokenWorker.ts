/// <reference lib="webworker" />

// Este Worker roda em uma thread separada e faz refresh proativo do token.
// Em vez de ficar fazendo polling, ele calcula exatamente quando o token vai expirar
// e agenda o refresh para 2 minutos antes da expiração.

const REFRESH_MARGIN = 120000; // 2 minutos antes de expirar
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 segundos entre tentativas
const FALLBACK_CHECK_INTERVAL = 60000; // Se não tiver dados de expiração, checa a cada 60s

let refreshTimeoutId: number | null = null;

let config = {
    AUTH_URL: "",
    CLIENT_ID: "",
    CLIENT_SECRET: "",
    API_OAUTH2_ROUTES: ""
};

// Flag para evitar refresh duplicado
let isRefreshing = false;

self.onmessage = (event: MessageEvent) => {
    const { type, payload } = event.data;

    if (type === 'INIT') {
        config = payload;
        // Pede os dados do storage para agendar o primeiro refresh
        requestStorageData();
    } else if (type === 'STOP') {
        cancelScheduledRefresh();
    } else if (type === 'STORAGE_DATA') {
        handleStorageData(payload);
    }
};

function requestStorageData() {
    self.postMessage({ type: 'CHECK_STORAGE' });
}

function cancelScheduledRefresh() {
    if (refreshTimeoutId) {
        self.clearTimeout(refreshTimeoutId);
        refreshTimeoutId = null;
    }
}

function handleStorageData(payload: { refreshToken: string | null, expiresAt: string | null }) {
    const { refreshToken, expiresAt } = payload;

    if (!refreshToken || !expiresAt) {
        // Sem dados de token — agenda uma checagem futura caso o user faça login
        scheduleNextCheck(FALLBACK_CHECK_INTERVAL);
        return;
    }

    const expiresAtMs = parseInt(expiresAt);
    const now = Date.now();
    const timeUntilExpiry = expiresAtMs - now;
    const timeUntilRefresh = timeUntilExpiry - REFRESH_MARGIN;

    if (timeUntilRefresh <= 0) {
        // Token já está expirando ou expirou — refresh imediato
        console.log("[TokenWorker] Token expiring now, refreshing immediately...");
        doRefresh(refreshToken);
    } else {
        // Agenda o refresh para o momento certo
        const minutes = Math.round(timeUntilRefresh / 60000);
        console.log(`[TokenWorker] Token OK, refresh scheduled in ${minutes}min`);
        scheduleRefresh(refreshToken, timeUntilRefresh);
    }
}

function scheduleRefresh(refreshToken: string, delayMs: number) {
    cancelScheduledRefresh();
    refreshTimeoutId = self.setTimeout(() => {
        doRefresh(refreshToken);
    }, delayMs);
}

function scheduleNextCheck(delayMs: number) {
    cancelScheduledRefresh();
    refreshTimeoutId = self.setTimeout(() => {
        requestStorageData();
    }, delayMs);
}

async function doRefresh(refreshToken: string) {
    if (isRefreshing) return;
    isRefreshing = true;

    const newTokens = await performRefreshWithRetry(refreshToken);

    if (newTokens && !('fatal' in newTokens)) {
        self.postMessage({ type: 'TOKENS_REFRESHED', payload: newTokens });
        console.log("[TokenWorker] Refresh succeeded, scheduling next refresh");

        // Agenda o próximo refresh baseado no novo expires_in
        const nextRefreshIn = (newTokens.expires_in * 1000) - REFRESH_MARGIN;
        if (nextRefreshIn > 0) {
            // Pede os dados atualizados do storage após um breve delay (para dar tempo de salvar)
            scheduleNextCheck(1000);
        }
    } else if (newTokens && 'fatal' in newTokens) {
        console.log("[TokenWorker] Session expired (invalid_grant).");
        self.postMessage({ type: 'SESSION_EXPIRED' });
        // Continua checando periodicamente caso o user logue em outra aba
        scheduleNextCheck(FALLBACK_CHECK_INTERVAL);
    } else {
        console.log("[TokenWorker] All refresh retries exhausted.");
        self.postMessage({ type: 'LOGOUT_REQUIRED' });
        // Continua checando periodicamente caso o user logue em outra aba
        scheduleNextCheck(FALLBACK_CHECK_INTERVAL);
    }

    isRefreshing = false;
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function performRefreshWithRetry(refreshToken: string) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        console.log(`[TokenWorker] Refresh attempt ${attempt}/${MAX_RETRIES}...`);
        const result = await performRefresh(refreshToken);

        if (result && 'fatal' in result) {
            console.log("[TokenWorker] Fatal error during refresh (invalid_grant). Aborting retries.");
            return result;
        }

        if (result) return result;

        if (attempt < MAX_RETRIES) {
            console.log(`[TokenWorker] Attempt ${attempt} failed, retrying in ${RETRY_DELAY / 1000}s...`);
            await delay(RETRY_DELAY);
        }
    }
    return null;
}

async function performRefresh(refreshToken: string) {
    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', refreshToken);

        const authHeader = 'Basic ' + btoa(`${config.CLIENT_ID}:${config.CLIENT_SECRET}`);

        const response = await fetch(`${config.API_OAUTH2_ROUTES}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': authHeader
            },
            body: params
        });

        if (response.ok) {
            const data = await response.json();
            return {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_in: data.expires_in
            };
        } else if (response.status === 400) {
            const data = await response.json();
            if (data.error === "invalid_grant") {
                return { fatal: true };
            }
        }
        return null;
    } catch (e) {
        return null;
    }
}
