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

    private renderSessionExpiredModal() {
        return (
            <div className="session-expired-overlay">
                <div className="session-expired-modal">
                    <div className="session-expired-icon">⚠️</div>
                    <h2>Sessão Expirada</h2>
                    <p>Sua sessão expirou, mas seu trabalho está salvo nesta página.</p>
                    <p className="session-expired-hint">Faça login novamente para continuar.</p>
                    <div className="session-expired-actions">
                        <button
                            className="session-expired-btn session-expired-btn-primary"
                            onClick={() => {
                                window.location.href = AuthService.getLoginUrl(window.location.pathname);
                            }}
                        >
                            Fazer Login
                        </button>
                        <button
                            className="session-expired-btn session-expired-btn-secondary"
                            onClick={() => {
                                // Tenta re-validar (caso o user tenha logado em outra aba)
                                this.context.revalidate();
                            }}
                        >
                            Já fiz login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    private renderNotAdminModal() {
        return (
            <div className="session-expired-overlay">
                <div className="session-expired-modal">
                    <div className="session-expired-icon">🚫</div>
                    <h2>Acesso Negado</h2>
                    <p>Você não tem permissão de administrador.</p>
                    <div className="session-expired-actions">
                        <button
                            className="session-expired-btn session-expired-btn-primary"
                            onClick={() => {
                                window.location.href = FRONTEND_URL;
                            }}
                        >
                            Ir para o site
                        </button>
                        <button
                            className="session-expired-btn session-expired-btn-secondary"
                            onClick={() => {
                                AuthService.logout();
                            }}
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    protected abstract renderContent(): React.ReactNode;

    render() {
        const showSessionExpired = !this.context.loading && !this.context.isLoggedIn;
        const showNotAdmin = !this.context.loading && this.context.isLoggedIn && !this.context.isAdmin;

        return (
            <>
                <Header />
                {this.state.err ? (
                    this.getError(this.state.err)
                ) : this.renderContent()}
                {showSessionExpired && this.renderSessionExpiredModal()}
                {showNotAdmin && this.renderNotAdminModal()}
                {/*<Footer/>*/}
            </>
        )
    }
}