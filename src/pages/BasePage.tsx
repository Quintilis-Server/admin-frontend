import type { BaseProps, PageState } from "../types/PageTypes.ts";
import { BaseComponent } from "../components/BaseComponent.tsx";
import type { BaseException } from "../exceptions/BaseException.ts";
import { Header } from "../components/Header.tsx";
import { UserContext } from "../context/UserContext.tsx";
import { FRONTEND_URL } from "../Consts.ts";
import { AuthService } from "../service/AuthService.ts";

export abstract class BasePage<P extends BaseProps, S extends PageState> extends BaseComponent<P, S> {

    static contextType = UserContext;
    declare context: React.ContextType<typeof UserContext>;

    public constructor(props: P, initialState: S);
    public constructor(initialState: S);

    public constructor(arg1: P | S, arg2?: S) {
        if (arg2) {
            super(arg1 as P);
            this.state = arg2;
        } else {
            super({} as P);
            this.state = arg1 as S;
        }
    }

    componentDidMount() {
        document.title = `${this.state.title} - Quintilis`
        this.checkAuthStatus();
    }

    componentDidUpdate() {
        this.checkAuthStatus();
    }

    private checkAuthStatus() {
        if (this.context.loading) {
            return; // Wait until context finishes verifying the token
        }

        if (!this.context.isLoggedIn) {
            window.location.href = AuthService.getLoginUrl()
        } else if (!this.context.isAdmin) {
            alert("Not admin")
            window.location.href = FRONTEND_URL
        }
    }

    protected getError(err: BaseException | null) {
        if (!err) {
            return (
                <div className='error-wrapper'>
                    <p className="error">An unknown error occured</p>
                </div>
            );
        }
        const hasErrCodeMethod = typeof (err as BaseException).getErrCode() === 'function';

        return (
            <div className="error-wrapper">
                <p className="error">Erro ao carregar a página.</p>
                <p className="error-reason">{err.name}</p>
                <p className="error-status">{err.message}</p>
                {hasErrCodeMethod && (
                    <p className="error-status">CODE: {err.getErrCode()}</p>
                )}
            </div>
        )
    }

    protected abstract renderContent(): React.ReactNode;

    render() {
        return (
            <>
                <Header />
                {this.state.err ? (
                    this.getError(this.state.err)
                ) : this.renderContent()}
                {/*<Footer/>*/}
            </>
        )
    }
}