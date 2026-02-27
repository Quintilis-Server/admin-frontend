import { BasePage } from "./BasePage.tsx";
import type { BaseProps, PageState } from "../types/PageTypes.ts";
import "../stylesheet/HomePageStyle.scss"
import {ListComponent, type SortOption} from "../components/ListComponent.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export type BaseHomeState<T> = PageState & {
    items: T[];
    currentPage: number;
    totalPages: number;
}

export abstract class BaseHomePage<T extends object, P extends BaseProps, S extends BaseHomeState<T>> extends BasePage<P, S> {
    protected abstract getNewPath(): string;
    protected abstract getApiUrl(): string;
    protected abstract getPageTitle(): string;
    protected abstract renderItem(item: T): React.ReactNode;
    protected abstract getSearchableText(item: T): string;
    protected abstract getItemLink(item: T): string;

    protected getSortOptions(): SortOption[] {
        return [];
    }

    protected getSortValue(item: T, field: string): string | number {
        return (item as Record<string, any>)[field] ?? "";
    }

    protected getPageSize(): number {
        return 10;
    }

    public constructor(props: P) {
        super(props, {
            items: [],
            currentPage: 1,
            totalPages: 1,
            loading: true,
            title: ""
        } as unknown as S);
    }

    async componentDidMount() {
        super.componentDidMount();
        this.setState({ title: this.getPageTitle() });
        // await this.fetchPage(1);
    }

    // protected async fetchPage(page: number) {
    //     const result = await this.get<T[]>(this.getApiUrl(page));
    //     if (result !== null) {
    //         const items = result.data.data;
    //         this.setState({
    //             items: items,
    //             currentPage: page,
    //             totalPages: Math.max(1, Math.ceil(items.length / this.getPageSize()))
    //         } as unknown as Pick<S, keyof S>);
    //     }
    // }
    protected renderContent(): React.ReactNode {
        return (
            <div className="main-home container">
                <main>
                    <div className={"title"}>
                        <h1>{this.getPageTitle()}</h1>
                        <a className="new-button" href={this.getNewPath()}>Novo <FontAwesomeIcon icon={faPlus}/></a>
                    </div>

                    <div className="list">
                        <ListComponent<T, T[]>
                            renderItem={(item) => this.renderItem(item)}
                            getItemLink={(item) => this.getItemLink(item)}
                            getSearchableText={(item) => this.getSearchableText(item)}
                            sortOptions={this.getSortOptions()}
                            getSortValue={(item, field) => this.getSortValue(item, field)}
                            apiUrl={this.getApiUrl()}
                        />
                    </div>
                </main>
            </div>
        );
    }
}