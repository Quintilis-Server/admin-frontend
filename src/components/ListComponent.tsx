import * as React from "react";
import "../stylesheet/ListComponentStyle.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { BaseComponent } from "./BaseComponent.tsx";
import type { PageResponse } from "../types/ApiResponseType.ts";

export type SortOption<T> = {
    label: string;
    field: Extract<keyof T, string>;
}

export type ListComponentProps<T> = {
    apiUrl: string;
    renderItem: (item: T) => React.ReactNode;
    getItemLink: (item: T) => string;
    getSearchableText: (item: T) => string;
    withPage?: boolean;
    sortOptions?: SortOption<T>[];
    getSortValue?: (item: T, field: string) => string | number;
    className?: string;
    itemClassName?: string;
}

type ListState<T> = {
    originalItems: T[];
    items: T[];
    loading: boolean;
    currentPage: number;
    totalPages: number;
    searchQuery: string;
    sortField: string;
    sortDirection: 'asc' | 'desc';
}

export class ListComponent<T extends object, R extends object> extends BaseComponent<ListComponentProps<T>, ListState<T>> {

    private searchTimeout?: ReturnType<typeof setTimeout>;

    constructor(props: ListComponentProps<T>) {
        super(props);
        this.state = {
            originalItems: [],
            items: [],
            loading: true,
            currentPage: 1,
            totalPages: 1,
            searchQuery: "",
            sortField: "",
            sortDirection: 'asc'
        } as ListState<T>;
    }

    // 1. CARREGA OS DADOS ANTES DE FAZER O FETCH INICIAL
    async componentDidMount() {
        const restoredState = this.loadFromSessionStorage();

        // Atualiza o state com o que tinha no storage e SÓ ENTÃO faz o fetch
        this.setState(restoredState, async () => {
            await this.fetchData(this.state.currentPage);
        });
    }

    // 2. SALVA AUTOMATICAMENTE QUALQUER MUDANÇA (Magia do React)
    componentDidUpdate(_prevProps: ListComponentProps<T>, prevState: ListState<T>) {
        // Se qualquer um desses campos mudou de valor, salva no storage!
        if (
            prevState.searchQuery !== this.state.searchQuery ||
            prevState.sortField !== this.state.sortField ||
            prevState.sortDirection !== this.state.sortDirection ||
            prevState.currentPage !== this.state.currentPage
        ) {
            this.saveToSessionStorage();
        }
    }

    // 🔥 Trocamos Partial por Pick, listando exatamente o que estamos devolvendo!
    private loadFromSessionStorage = (): Pick<ListState<T>, 'searchQuery' | 'sortField' | 'sortDirection' | 'currentPage'> => {
        const prefix = this.props.apiUrl;
        const search = sessionStorage.getItem(`${prefix}_search`);
        const sortField = sessionStorage.getItem(`${prefix}_sortField`);
        const sortDirection = sessionStorage.getItem(`${prefix}_sortDirection`);
        const pageStr = sessionStorage.getItem(`${prefix}_page`);

        const page = pageStr ? parseInt(pageStr, 10) : 1;

        return {
            searchQuery: search ?? "",
            sortField: sortField ?? "",
            sortDirection: (sortDirection === 'desc' ? 'desc' : 'asc'),
            currentPage: isNaN(page) ? 1 : page
        };
    }

    private saveToSessionStorage = () => {
        const prefix = this.props.apiUrl;
        sessionStorage.setItem(`${prefix}_search`, this.state.searchQuery);
        sessionStorage.setItem(`${prefix}_sortField`, this.state.sortField); // Corrigido aqui (estava salvando sortDirection no lugar do sortField antes)
        sessionStorage.setItem(`${prefix}_sortDirection`, this.state.sortDirection);
        sessionStorage.setItem(`${prefix}_page`, this.state.currentPage.toString());
    }

    private isPageResponse(data: any): data is PageResponse<T> {
        return data && typeof data === 'object' && 'content' in data && 'totalPages' in data;
    }

    private fetchData = async (page: number) => {
        await this.executeAsync(async () => {
            const url = new URL(this.props.apiUrl);

            if (this.props.withPage) url.searchParams.set("page", (page - 1).toString());

            if (this.state.sortField) {
                url.searchParams.append("sort", `${this.state.sortField},${this.state.sortDirection}`);
            }

            if (this.state.searchQuery.trim()) {
                url.searchParams.append("search", this.state.searchQuery.trim());
            }

            const result = await this.get<R>(url);

            if (result && result.data.success) {
                const payload = result.data.data;

                if (this.isPageResponse(payload)) {
                    this.setState({
                        originalItems: payload.content,
                        items: payload.content,
                        totalPages: payload.totalPages,
                        currentPage: payload.number + 1
                    });
                } else if (Array.isArray(payload)) {
                    this.setState({
                        originalItems: payload,
                        items: payload,
                        totalPages: 1,
                        currentPage: 1
                    });
                }
            }
        });
    }

    private handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;

        this.setState({ searchQuery: query }, () => {
            if (this.props.withPage) {
                if (this.searchTimeout) {
                    clearTimeout(this.searchTimeout);
                }

                this.searchTimeout = setTimeout(() => {
                    this.fetchData(1);
                }, 500);

            } else {
                const filtered = query.trim()
                    ? this.state.originalItems.filter(item =>
                        this.props.getSearchableText(item).toLowerCase().includes(query.toLowerCase())
                    )
                    : [...this.state.originalItems];

                this.setState({ items: filtered });
            }
        });
    }

    private handleSort = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const field = e.target.value;
        this.setState({ sortField: field ?? "" }, async () => {
            await this.fetchData(this.state.currentPage);
        });
    }

    private toggleSortDirection = () => {
        const newDir = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
        this.setState({ sortDirection: newDir }, async () => {
            await this.fetchData(this.state.currentPage);
        });
    }

    private handlePageChange = async (page: number) => {
        await this.fetchData(page);
    }

    render() {
        const { sortOptions = [], className, itemClassName } = this.props;
        const { items, searchQuery, sortField, sortDirection, currentPage, totalPages } = this.state;

        return (
            <div className="list-container">
                {/* O seu JSX continua intacto aqui... */}
                <div className="list-toolbar">
                    <div className="search-bar">
                        <FontAwesomeIcon className={"search-icon"} icon={faMagnifyingGlass}/>
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            value={searchQuery}
                            onChange={this.handleSearch}
                            className="search-input"
                        />
                    </div>

                    {sortOptions.length > 0 && (
                        <div className="sort-controls">
                            <select
                                value={sortField}
                                onChange={this.handleSort}
                                className="sort-select"
                            >
                                <option value="">Ordenar por...</option>
                                {sortOptions.map(opt => (
                                    <option key={opt.field} value={opt.field}>{opt.label}</option>
                                ))}
                            </select>
                            {sortField && (
                                <button className="sort-direction-btn" onClick={this.toggleSortDirection}>
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className={`list ${className ? className : ""}`}>
                    {items.length > 0 ? (
                        items.map((item, index) => (
                            <a href={this.props.getItemLink(item)} className={`list-item ${itemClassName ? itemClassName : ""}`} key={index}>
                                {this.props.renderItem(item)}
                            </a>
                        ))
                    ) : (
                        <div className="list-empty">
                            <p>Nenhum resultado encontrado.</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="pagination-btn"
                            disabled={currentPage <= 1}
                            onClick={() => this.handlePageChange(currentPage - 1)}
                        >
                            ← Anterior
                        </button>

                        <div className="pagination-pages">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`pagination-page ${page === currentPage ? 'active' : ''}`}
                                    onClick={() => this.handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            className="pagination-btn"
                            disabled={currentPage >= totalPages}
                            onClick={() => this.handlePageChange(currentPage + 1)}
                        >
                            Próxima →
                        </button>
                    </div>
                )}
            </div>
        );
    }
}