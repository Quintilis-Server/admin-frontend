import {BaseCreationPage} from "./BaseCreationPage.tsx";
import type {FormSchema, FormState} from "../../types/FormOption.ts";
import type {BaseProps} from "../../types/PageTypes.ts";
import {UserContext} from "../../context/UserContext.tsx";

export abstract class BaseAdminCreationPage<
    T extends object,
    F extends FormSchema<T>,
    P extends BaseProps = BaseProps,
    S extends FormState<T> = FormState<T>
> extends BaseCreationPage<T, F, P, S> {

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

    // render() {
    //     const { isAdmin, isLoggedIn, loading } = this.context;
    //
    //     if (loading) {
    //         return <div className="loading-screen">Carregando...</div>;
    //     }
    //
    //     if (!isLoggedIn || !isAdmin) {
    //         return null;
    //     }
    //
    //     return super.render();
    // }
}