import { BasePage } from "./BasePage.tsx";
import type { BaseProps, PageState } from "../types/PageTypes.ts";
import "../stylesheet/HomePageStyle.scss"

export type BaseHomeState<T> = PageState & {
    items: T[]
}

export abstract class BaseHomePage<P extends BaseProps, S extends BaseHomeState<T>, T> extends BasePage<P, S> {
    protected abstract getApiUrl(): string;
    protected abstract getPageTitle(): string;
    protected abstract getNewPath(): string;
    protected abstract getNewLabel(): string;
    protected abstract renderItem(item: T): React.ReactNode;

    public constructor(props: P) {
        super(props, { items: [], loading: true, title: "" } as unknown as S);
    }

    async componentDidMount() {
        super.componentDidMount();
        this.setState({ title: this.getPageTitle() });
        const result = await this.getFromApi<T[]>(this.getApiUrl());
        if (result !== null) {
            this.setState({
                items: result.data.data
            });
        }
    }

    protected renderContent(): React.ReactNode {
        return (
            <div className="main-home container">
                <main>
                    <div className={"title"}>
                        <h1>{this.getPageTitle()}</h1>
                        <a className="new-button" href={this.getNewPath()}>{this.getNewLabel()}</a>
                    </div>

                    <div className="list">
                        {this.state.items.map((item) => this.renderItem(item))}
                    </div>
                </main>
            </div>
        );
    }
}