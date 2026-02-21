import type {BaseProps, PageState} from "../types/PageTypes.ts";
import {UserContext} from "../context/UserContext.tsx";
import {HeaderAdmin} from "../components/HeaderAdmin.tsx";
import {BasePage} from "./BasePage.tsx";

export abstract class BaseAdminPage<P extends BaseProps = BaseProps, S extends PageState = PageState> extends BasePage<P, S> {
    static contextType = UserContext;
    declare context: React.ContextType<typeof UserContext>;

    componentDidMount() {
        super.componentDidMount();
        this.checkAdminAccess();
    }

    componentDidUpdate() {
        this.checkAdminAccess();
    }

    private checkAdminAccess() {
        const { isAdmin, isLoggedIn, loading } = this.context;

        if (loading) return;

        if (!isLoggedIn || !isAdmin) {
             window.location.href = "/";
        }
    }

    protected abstract renderContent(): React.ReactNode;

    render() {
        return (
            <>
                <HeaderAdmin/>
                {this.state.err ? (
                    this.getError(this.state.err)
                ) : (
                    this.renderContent()
                )}
            </>
        )
    }

    // renderContent() {
    //     const { isAdmin, isLoggedIn, loading } = this.context;
    //
    //     if (loading) {
    //         return <div className="loading-screen">Carregando...</div>;
    //     }
    //
    //     if (!isLoggedIn || !isAdmin) {
    //         // Retorna null enquanto o redirecionamento acontece
    //         return null;
    //     }
    //
    //     return super.render();
    // }
}