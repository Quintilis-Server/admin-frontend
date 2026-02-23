import {BaseHomePage, type BaseHomeState} from "../../BaseHomePage.tsx";
import type {BaseProps} from "../../../types/PageTypes.ts";
import type {Category} from "../../../types/ForumTypes.ts";
import HomeListComponent from "../../../components/HomeListComponent.tsx";

export class CategoryHomePage extends BaseHomePage<BaseProps, BaseHomeState<Category>, Category> {
    protected getApiUrl(): string {
        return "/forum/category/all"
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
        return <HomeListComponent type={item} key={item.display_order}/>
    }

}