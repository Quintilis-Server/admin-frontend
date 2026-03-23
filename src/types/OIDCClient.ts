import type {FormSchema} from "./FormOption.ts";

export interface ClientSettingsDTO {
    requireProofKey: boolean
    requireAuthorizationConsent: boolean
}

export interface TokenSettingsDTO {
    reuseRefreshTokens: boolean
    accessTokenTtlHours: number
    refreshTokenTtlHours: number
    authorizationCodeTtlMinutes: number
}

export interface OIDCClientDTO {
    id?: string
    clientId: string
    clientSecret?: string
    clientName: string
    clientAuthenticationMethods: string[]
    authorizationGrantTypes: string[]
    redirectUris: string[]
    postLogoutRedirectUris: string[]
    scopes: string[]
    clientSettings: ClientSettingsDTO
    tokenSettings: TokenSettingsDTO
}
export interface OIDCClientForm {
    clientId: string
    clientSecret: string
    clientName: string
    clientAuthenticationMethods: string[]
    authorizationGrantTypes: string[]
    redirectUris: string[]
    postLogoutRedirectUris: string[]
    scopes: string[]
    // settings achatados
    requireProofKey: boolean
    requireAuthorizationConsent: boolean
    reuseRefreshTokens: boolean
    accessTokenTtlHours: number
    refreshTokenTtlHours: number
    authorizationCodeTtlMinutes: number
}

export const OIDC_SCHEMA: FormSchema<OIDCClientForm> = {
    clientId: { label: "Client ID", type: "text", readonly: false },
    clientSecret: { label: "Client Secret", type: "text", readonly: false },
    clientName: { label: "Nome", type: "text", readonly: false },
    clientAuthenticationMethods: {
        label: "Métodos de Autenticação", type: "multiselect", readonly: false,
        options: [{ label: "client_secret_basic", value: "client_secret_basic" }]
    },
    authorizationGrantTypes: {
        label: "Grant Types", type: "multiselect", readonly: false,
        options: [
            { label: "authorization_code", value: "authorization_code" },
            { label: "refresh_token", value: "refresh_token" }
        ]
    },
    redirectUris: { label: "Redirect URIs", type: "dynamic-list", readonly: false },
    postLogoutRedirectUris: { label: "Post Logout URIs", type: "dynamic-list", readonly: false },
    scopes: {
        label: "Scopes", type: "multiselect", readonly: false,
        options: [
            { label: "openid", value: "openid" },
            { label: "read_profile", value: "read_profile" },
            { label: "offline_access", value: "offline_access" }
        ]
    },
    requireProofKey: { label: "Require Proof Key (PKCE)", type: "select", readonly: false,
        options: [{ label: "Não", value: "false" }, { label: "Sim", value: "true" }]
    },
    requireAuthorizationConsent: { label: "Require Consent", type: "select", readonly: false,
        options: [{ label: "Não", value: "false" }, { label: "Sim", value: "true" }]
    },
    reuseRefreshTokens: { label: "Reutilizar Refresh Tokens", type: "select", readonly: false,
        options: [{ label: "Sim", value: "true" }, { label: "Não", value: "false" }]
    },
    accessTokenTtlHours: { label: "Access Token TTL (horas)", type: "number", readonly: false },
    refreshTokenTtlHours: { label: "Refresh Token TTL (horas)", type: "number", readonly: false },
    authorizationCodeTtlMinutes: { label: "Auth Code TTL (minutos)", type: "number", readonly: false },
}