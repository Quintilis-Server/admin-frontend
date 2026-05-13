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
            const response = await this.get<T>(`${resource}/${id}/with-inactive`)
            if (response && response.data) {
                let data = response.data.data;

                // --- TRATAMENTO DE DATAS AQUI ---
                const schema = this.getFormSchema();
                // Percorre o schema procurando campos do tipo 'date'
                Object.keys(schema).forEach(key => {
                    const field = schema[key as keyof T];
                    const value = (data as any)[key];

                    // Se for campo de data e tiver valor, corta para YYYY-MM-DD
                    if (field.type === 'date' && value && typeof value === 'string') {
                        // "2026-05-01T00:00:00Z" -> "2026-05-01"
                        (data as any)[key] = value.split('T')[0];
                    }
                });
                // --------------------------------

                this.setState(prevState => ({
                    ...prevState,
                    formData: data,
                    loading: false
                }));
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
            //TODO trocar de post para DELETE
            const response = await this.delete<null>(`${this.getResourceName()}/${id}`)

            if (!response || !response.data || !response.data.success) throw BaseException.fromResponse(response.data)

            alert("Deletado com sucesso")
            window.location.href = this.getReturnURL()
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
            const dataToSend = { ...this.state.formData as any };

            const schema = this.getFormSchema();
            Object.keys(schema).forEach((key) => {
                const field = schema[key as keyof T];
                const value = (dataToSend as any)[key];

                if (schema[key as keyof T].type === 'image') {
                    delete dataToSend[key];
                }

                // Se o campo for data e tiver valor, transformamos em ISO String
                if (field.type === 'date' && value && typeof value === 'string') {
                    // Se a string tiver apenas 10 caracteres (YYYY-MM-DD)
                    if (value.length === 10) {
                        (dataToSend as any)[key] = new Date(value).toISOString();
                    }
                }
            });
            const response = await this.post<T, T>(`${this.getResourceName()}/${id}/update`, dataToSend);
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