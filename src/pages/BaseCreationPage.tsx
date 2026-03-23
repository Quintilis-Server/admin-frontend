import type {FormSchema, FormState} from "../types/FormOption.ts";
import type {BaseProps} from "../types/PageTypes.ts";
import {BaseFormPage} from "./BaseFormPage.tsx";
import {BaseException} from "../exceptions/BaseException.ts";
import {ErrorCode} from "../types/ApiResponseType.ts";

/**
 * Base da página de criação
 * @extends BaseFormPage que faz o trabalho de criar os elementos das páginas Form
 *
 * @template T Objeto a ser criado
 * @template F `FormSchema<T>` para criação de elementos na página
 * @template P Props da página, extende o `BaseProps`
 * @template S State da página, extende o `FormState<T>`
 */
export abstract class BaseCreationPage<
    T extends object,
    F extends FormSchema<T>,
    P extends BaseProps = BaseProps,
    S extends FormState<T> = FormState<T>
> extends BaseFormPage<T, F, P, S> {

    protected abstract getResourceName(): string;
    protected abstract getReturnURL(): string;

    protected async handleSubmit(): Promise<void> {
        const resource = this.getResourceName();
        try {
            this.setState(prevState => ({ ...prevState, loading: true }))

            const response = await this.post<T, T>(`${resource}/new`, this.state.formData);

            if(!response) {
                throw new BaseException(ErrorCode.UNKNOWN_ERROR)
            }

            if(!response.data.success) {
                throw new BaseException(response.data.errorCode, response.data.message)
            }

            alert("CRIADO COM SUCESSO")

            window.location.href = this.getReturnURL()
        }catch (e) {
            this.setState({
                err: e instanceof BaseException ? e : new BaseException(ErrorCode.UNKNOWN_ERROR, "Erro desconhecido")
            } as unknown as Pick<S, "err">)
        } finally {
            this.setState(prevState => ({ ...prevState, loading: false }))
        }
    }
}