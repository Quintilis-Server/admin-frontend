import {BaseFormPage} from "./BaseFormPage.tsx";
import type {FormSchema, FormState} from "../types/FormOption.ts";
import type {BaseProps} from "../types/PageTypes.ts";
import {UserContext} from "../context/UserContext.tsx";

export abstract class BaseAdminFormPage<
    T extends object,
    F extends FormSchema<T>,
    P extends BaseProps,
    S extends FormState<T>
> extends BaseFormPage<T, F, P, S> {

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