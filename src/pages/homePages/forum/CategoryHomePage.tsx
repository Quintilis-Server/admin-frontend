import {BaseHomePage, type BaseHomeState} from "../../BaseHomePage.tsx";
import type {BaseProps} from "../../../types/PageTypes.ts";
import type {Category} from "../../../types/ForumTypes.ts";
import {API_FORUM_ROUTES} from "../../../Consts.ts";

export class CategoryHomePage extends BaseHomePage<Category, BaseProps, BaseHomeState<Category>> {
    protected getSearchableText(item: Category): string {
        return `${item.title} ${item.description} ${item.slug}`;
    }
    protected getItemLink(item: Category): string {
        return `/forum/category/${item.id}`;
    }

    protected getApiUrl(): string {
        return `${API_FORUM_ROUTES}/category/all`;
    }
    protected getPageTitle(): string {
        return "Categorias"
    }
    protected getNewPath(): string {
        return "/forum/category/new"
    }
    protected getNewLabel(): string {
        return "Nova Categoria"
    }
    protected renderItem(item: Category): React.ReactNode {
        return (
            <>
                <div>
                    <h2>{item.title}</h2>
                    <span>slug: {item.slug}</span>
                </div>
                <div>
                    <p>{item.description}</p>
                    <span>Tópicos: {item.topics.length}</span>
                </div>
            </>
        )
    }
}