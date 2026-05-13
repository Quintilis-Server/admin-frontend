import {BaseHomePage} from "../../BaseHomePage.tsx";
import {API_AUTH_ROUTES} from "../../../Consts.ts";
import type {OIDCClientDTO} from "../../../types/OIDCClient.ts";

export class OIDCClientHomePage extends BaseHomePage<OIDCClientDTO, any, any> {
    protected getNewPath(): string {
        return "/auth/oidc/new"
    }

    protected getApiUrl(): string {
        return `${API_AUTH_ROUTES}/oidc/all/with-inactive`
    }

    protected getPageTitle(): string {
        return "OIDC Clients"
    }

    protected renderItem(item: OIDCClientDTO): React.ReactNode {
        return (
            <div>
                <p>Nome: {item.clientId}</p>
                <span>scopes: {item.scopes.join(", ")}</span>
            </div>
        )
    }

    protected getSearchableText(item: OIDCClientDTO): string {
        return `${item.clientId} ${item.clientName} ${item.scopes}`;
    }

    protected getItemLink(item: OIDCClientDTO): string {
        return `/auth/oidc/${item.id}`
    }
}