import type {BaseProps, PageState} from "../types/PageTypes.ts";
import {BaseComponent} from "../components/BaseComponent.tsx";
import type {BaseException} from "../exceptions/BaseException.ts";
import {Header} from "../components/Header.tsx";
import {UserContext} from "../context/UserContext.tsx";
import {FRONTEND_URL} from "../Consts.ts";
import {AuthService} from "../service/AuthService.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBan, faTriangleExclamation} from "@fortawesome/free-solid-svg-icons";
import "../stylesheet/LoadingStyle.scss"
import "../stylesheet/ErrorPopupStyle.scss"

export abstract class BasePage<P extends BaseProps, S extends PageState> extends BaseComponent<P, S> {

    static contextType = UserContext;
    declare context: React.ContextType<typeof UserContext>;

    public constructor(props: P, initialState: S);
    public constructor(initialState: S);

    public constructor(arg1: P | S, arg2?: S) {
        if (arg2) {
            super(arg1 as P);
            this.state = {
                ...arg2 as S,
                loading: false,
            };
        } else {
            super({} as P);
            this.state = {
                ...arg1 as S,
                loading: false
            };
        }
    }

    componentDidMount() {
        document.title = `${this.state.title} - Quintilis`
    }

    private dismissError = () => {
        this.setState({ err: undefined } as unknown as Pick<S, "err">);
    }

    private goHome = () => {
        window.location.href = "/";
    }

    protected renderErrorPopup(err: BaseException | null) {
        const errMessage = err?.message || "Ocorreu um erro desconhecido.";
        const errCode = err?.getErrCode?.();

        return (
            <div className="error-overlay" onClick={this.dismissError}>
                <div className="error-popup" onClick={(e) => e.stopPropagation()}>
                    <div className="error-popup-header">
                        <span className="error-popup-icon">⚠</span>
                        <h3 className="error-popup-title">Erro</h3>
                    </div>

                    <p className="error-popup-message">{errMessage}</p>

                    {errCode && (
                        <span className="error-popup-code">CODE: {errCode}</span>
                    )}

                    <div className="error-popup-actions">
                        <button className="error-popup-btn error-popup-btn-dismiss" onClick={this.dismissError}>
                            Fechar
                        </button>
                        <button className="error-popup-btn error-popup-btn-home" onClick={this.goHome}>
                            Ir para Início
                        </button>
                    </div>
                </div>
            </div>
        )
    }


    private renderSessionExpiredModal() {
        return (
            <div className="session-expired-overlay">
                <div className="session-expired-modal">
                    <div className="session-expired-icon"><FontAwesomeIcon icon={faTriangleExclamation} /></div>
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

    protected renderLoading() {
        return (
            <div className="loading-wrapper">
                <div className="loading-spinner" />
                <p className="loading-text">Carregando...</p>
            </div>
        )
    }

    private renderNotAdminModal() {
        return (
            <div className="session-expired-overlay">
                <div className="session-expired-modal">
                    <div className="session-expired-icon"><FontAwesomeIcon icon={faBan}/></div>
                    <h2>Acesso Negado</h2>
                    <p>Você não tem permissão de administrador.</p>
                    <div className="session-expired-actions">
                        <button
                            className="session-expired-btn session-expired-btn-primary"
                            onClick={() => {
                                // AuthService.logout()
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
                {this.state.err && this.renderErrorPopup(this.state.err)}
                {showSessionExpired && this.renderSessionExpiredModal()}
                {showNotAdmin && this.renderNotAdminModal()}
                {this.state.loading ? this.renderLoading() : this.renderContent()}
                {/*<Footer/>*/}
            </>
        )
    }
}