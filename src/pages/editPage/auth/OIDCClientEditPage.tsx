import {BaseEditPage} from "../../BaseEditPage.tsx";
import {OIDC_SCHEMA, type OIDCClientForm} from "../../../types/OIDCClient.ts";
import {API_AUTH_ROUTES} from "../../../Consts.ts";

export class OIDCClientEditPage extends BaseEditPage<OIDCClientForm, typeof OIDC_SCHEMA>{
    protected getResourceName(): string {
        return `${API_AUTH_ROUTES}/oidc`
    }
    protected getReturnURL(): string {
        return "auth/oidc";
    }
    protected getFormSchema() {
        return OIDC_SCHEMA
    }

}