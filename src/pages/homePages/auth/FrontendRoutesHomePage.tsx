import {BaseHomePage} from "../../BaseHomePage.tsx";
import type {FrontendRoute} from "../../../types/FrontendRoute.ts";
import {API_AUTH_ROUTES} from "../../../Consts.ts";
import type {SortOption} from "../../../components/ListComponent.tsx";

export class FrontendRoutesHomePage extends BaseHomePage<FrontendRoute, any, any>{
    protected getNewPath(): string {
        return "/auth/frontend-routes/new"
    }

    override canCreate(): boolean {
        return true
    }
    protected getApiUrl(): string {
        return `${API_AUTH_ROUTES}/frontend-routes/all`
    }

    protected getSortOptions(): SortOption<FrontendRoute>[] {
        return [
            {label: "Caminho", field: "path"},
            {label: "Descrição", field: "description"}
        ]
    }

    protected getPageTitle(): string {
        return "Permissões de Telas do Frontend"
    }
    protected renderItem(item: FrontendRoute): React.ReactNode {
        return (
            <div>
                <div style={{display: "flex", flexDirection: "column", alignItems: "start"}}>
                    <p>Path: {item.path}</p>
                    <p>Descrição: {item.description}</p>
                </div>
            </div>
        )
    }
    protected getSearchableText(item: FrontendRoute): string {
        return `${item.path} ${item.description}`
    }
    protected getItemLink(item: FrontendRoute): string {
        return `/auth/frontend-routes/${item.id}`
    }
    override withPage(): boolean {
        return true
    }
}
