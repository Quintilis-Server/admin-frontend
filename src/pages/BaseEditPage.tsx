import type { BaseProps } from "../types/PageTypes.ts";
import type { FormSchema, FormState } from "../types/FormOption.ts";
import { BaseFormPage } from "./BaseFormPage.tsx";
import { BaseException } from "../exceptions/BaseException.ts";
import * as React from "react";
import { ErrorCode } from "../types/ApiResponseType.ts";

export interface EditPageProps extends BaseProps {
    params: { id: string }
}

/**
 * Página base para edição de registros existentes.
 * @template T  **Entity**: O tipo do objeto que está sendo editado (ex: Category).
 * @template F  **Schema**: A estrutura do formulário (FormSchema<T>).
 * @template P  **Props**: As propriedades do componente (Padrão: EditPageProps).
 * @template S  **State**: O estado do componente (Padrão: BaseFormState<T>).
 */
export abstract class BaseEditPage<
    T extends object,
    F extends FormSchema<T>,
    P extends EditPageProps = EditPageProps,
    S extends FormState<T> = FormState<T>
> extends BaseFormPage<T, F, P, S> {
    constructor(props: P, state: S) {
        super(props, state);
    }

    protected abstract getResourceName(): string;
    protected abstract getReturnURL(): string;

    async componentDidMount() {
        super.componentDidMount()
        await this.fetchDataToEdit();
    }
    protected async fetchDataToEdit() {
        const resource = this.getResourceName()
        const id = this.props.params.id

        if (!id) {
            return;
        }
        try {
            const response = await this.get<T>(`${resource}/${id}`)
            if (response && response.data) {
                this.setState(prevState => ({
                    ...prevState,
                    formData: response.data.data,
                    loading: false
                }))
            }
        } catch (e) {
            this.setState({
                err: e instanceof BaseException ? e : new BaseException(ErrorCode.UNKNOWN_ERROR, "Erro ao carregar dados")
            });
        }
    }

    canDelete(): boolean {
        return true
    }

    protected headerActions(): React.ReactNode {
        if (!this.canDelete()) {
            return null
        }
        return (
            <button className="btn remove" onClick={() => this.handleDelete()}>
                Deletar
            </button>
        )
    }


    protected async handleDelete() {
        const id = this.props.params.id

        if (!id) return;

        if (!confirm("Tem certeza que deseja deletar este item?")) return

        try {
            const response = await this.post<null, null>(`${this.getResourceName()}/${id}/delete`, null)

            if (!response || !response.data || !response.data.success) throw BaseException.fromResponse(response.data)

            alert("Deletado com sucesso")
            window.location.href = `${this.getReturnURL()}`
        } catch (e) {
            console.log()
            this.setState({
                err: e instanceof BaseException ? e : new BaseException(ErrorCode.UNKNOWN_ERROR, "Erro ao deletar")
            })
        }
    }

    protected async handleSubmit() {
        const id = this.props.params.id;

        if (!id) return;

        try {
            const response = await this.put<T, T>(`${this.getResourceName()}/${id}/update`, this.state.formData);
            if (!response || !response.data || !response.data.success) throw BaseException.fromResponse<T>(response.data)

            alert("Atualizado com sucesso!")
            window.location.href = `/${this.getReturnURL()}`
        } catch (e) {
            this.setState({
                err: e instanceof BaseException ? e : new BaseException(ErrorCode.UNKNOWN_ERROR, "Erro ao atualizar")
            })
        }
    }
}