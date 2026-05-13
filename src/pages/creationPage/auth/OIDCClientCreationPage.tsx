import {BaseCreationPage} from "../../BaseCreationPage.tsx";
import {OIDC_SCHEMA, type OIDCClientDTO, type OIDCClientForm} from "../../../types/OIDCClient.ts";
import type {FormSchema, FormState} from "../../../types/FormOption.ts";
import {API_AUTH_ROUTES} from "../../../Consts.ts";

const INITIAL_STATE: FormState<OIDCClientForm> = {
    title: "Novo Cliente OAuth2",
    loading: false,
    formData: {
        clientId: "",
        clientSecret: "",
        clientName: "",
        clientAuthenticationMethods: ["client_secret_basic"],
        authorizationGrantTypes: ["authorization_code", "refresh_token"],
        redirectUris: [],
        postLogoutRedirectUris: [],
        scopes: ["openid"],
        requireProofKey: false,
        requireAuthorizationConsent: false,
        reuseRefreshTokens: true,
        accessTokenTtlHours: 1,
        refreshTokenTtlHours: 720,
        authorizationCodeTtlMinutes: 5,
    }
}
interface OIDCMetadata {
    grantTypes: string[]
    authenticationMethods: string[]
    scopes: string[]
}

export class OIDCClientCreationPage extends BaseCreationPage<OIDCClientForm,typeof OIDC_SCHEMA> {
    async componentDidMount() {
        super.componentDidMount();
        const response = await this.get<OIDCMetadata>(`${API_AUTH_ROUTES}/oidc/metadata`)
        if (response?.data?.success) {
            const meta = response.data.data
            // Atualiza as options do schema dinamicamente
            this.setState(prevState => ({
                ...prevState,
                metadata: meta
            }))
        }
    }

    constructor(props: any) {
        super(props, INITIAL_STATE as any)
    }

    protected getFormSchema(): FormSchema<OIDCClientForm> {
        const meta = (this.state as any).metadata as OIDCMetadata | undefined
        return {
            ...OIDC_SCHEMA,
            authorizationGrantTypes: {
                ...OIDC_SCHEMA.authorizationGrantTypes,
                options: (meta?.grantTypes ?? ["authorization_code", "refresh_token"])
                    .map(v => ({ label: v, value: v }))
            },
            clientAuthenticationMethods: {
                ...OIDC_SCHEMA.clientAuthenticationMethods,
                options: (meta?.authenticationMethods ?? ["client_secret_basic"])
                    .map(v => ({ label: v, value: v }))
            },
            scopes: {
                ...OIDC_SCHEMA.scopes,
                options: (meta?.scopes ?? ["openid"])
                    .map(v => ({ label: v, value: v }))
            }
        }
    }

    protected getResourceName() {
        return "/auth/oidc"
    }

    protected getReturnURL() {
        return "/auth/oidc"
    }

    // Converte o form achatado para o DTO aninhado antes de enviar
    protected async handleSubmit(): Promise<void> {
        const f = this.state.formData as unknown as OIDCClientForm
        const dto: OIDCClientDTO = {
            clientId: f.clientId,
            clientSecret: f.clientSecret,
            clientName: f.clientName,
            clientAuthenticationMethods: f.clientAuthenticationMethods,
            authorizationGrantTypes: f.authorizationGrantTypes,
            redirectUris: f.redirectUris,
            postLogoutRedirectUris: f.postLogoutRedirectUris,
            scopes: f.scopes,
            clientSettings: {
                requireProofKey: f.requireProofKey,
                requireAuthorizationConsent: f.requireAuthorizationConsent,
            },
            tokenSettings: {
                reuseRefreshTokens: f.reuseRefreshTokens,
                accessTokenTtlHours: f.accessTokenTtlHours,
                refreshTokenTtlHours: f.refreshTokenTtlHours,
                authorizationCodeTtlMinutes: f.authorizationCodeTtlMinutes,
            }
        }
        // chama o post diretamente com o dto montado
        const response = await this.post(`${API_AUTH_ROUTES}/oidc/new`, dto)
        console.log(response.data.data)
        window.location.href = this.getReturnURL()
    }
}
