import {BaseHomePage} from "../../BaseHomePage.tsx";
import type {RouteRule} from "../../../types/RouteRule.ts";
import {API_AUTH_ROUTES} from "../../../Consts.ts";
import type {SortOption} from "../../../components/ListComponent.tsx";

export class RoutesHomePage extends BaseHomePage<RouteRule, any, any>{
    protected getNewPath(): string {
        return "/routes/new"
    }

    override canCreate(): boolean {
        return false
    }
    protected getApiUrl(): string {
        return `${API_AUTH_ROUTES}/routes/all`
    }

    protected getSortOptions(): SortOption<RouteRule>[] {
        return [
            {label: "URL", field: "urlPattern"},
            {label: "Metodo", field: "httpMethod"},
            {label: "Nome do serviço", field: "serviceName"},
        ]
    }

    protected getPageTitle(): string {
        return "Permissões de endpoints"
    }
    protected renderItem(item: RouteRule): React.ReactNode {
        return (
            <div>
                <div style={{display: "flex", flexDirection: "column", alignItems: "start"}}>
                    <p>URL: {item.urlPattern}</p>
                    <p>Descrição: {item.description}</p>
                </div>
                <div style={{display: "flex", flexDirection: "column", alignItems: "start"}}>
                    <span>Metodo: {item.httpMethod}</span>
                    <span>Nome Serviço: {item.serviceName}</span>
                </div>
            </div>
        )
    }
    protected getSearchableText(item: RouteRule): string {
        return `${item.urlPattern} ${item.id} ${item.permissions.join(" ")}`
    }
    protected getItemLink(item: RouteRule): string {
        return `/routes/${item.id}`
    }
    override withPage(): boolean {
        return true
    }

}