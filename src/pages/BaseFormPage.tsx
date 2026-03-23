import type {FormSchema, FormState} from "../types/FormOption.ts";
import type {BaseProps} from "../types/PageTypes.ts";
import {BasePage} from "./BasePage.tsx";
import  {type ChangeEvent, type JSX} from "react";
import {API_URL} from "../Consts.ts";
import "../stylesheet/FormStyle.scss"
import type {Permission} from "../types/RoleTypes.ts";
import * as React from "react";
import {MultiSelect} from "../components/MultiSelect.tsx";
import {IconInput} from "../components/IconInput.tsx";
import {DynamicListInput} from "../components/DynamicListInput.tsx";

/**
 * Criação de páginas de form (edição e criação),
 * ele cria os elementos que vão aparecer na página a partir do `FormSchema`
 *
 * @template T Objeto a ser usado
 * @template F FormSchema do `T`
 * @template P Props da página, extende o `BaseProps`
 * @template S State da página, extende o `FormState<T>`
 */
export abstract class BaseFormPage<
    T extends object,
    F extends FormSchema<T>,
    P extends BaseProps,
    S extends FormState<T>
> extends BasePage<P, S> {
    public constructor(props: P, initialState: S);
    public constructor(initialState: S);
    public constructor(arg1: P | S, arg2?: S) {
        if(arg2) {
            super(arg1 as P, arg2)
        }else{
            super({} as P, arg1 as S)
        }
    }

    private typedEntries<O extends object>(obj: O): [keyof O, O[keyof O]][] {
        return Object.entries(obj) as [keyof O, O[keyof O]][]
    }

    protected handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        this.setState(prevState => ({
            ...prevState,
            formData: {
                ...prevState.formData,
                [id]: value
            }
        }));
    }

    protected handleMultiSelectChange = (id: string, selectedValues: string[]) => {
        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                [id]: selectedValues // Salva o array de strings limpinho
            }
        }));
    }

    protected handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, fieldKey: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione apenas arquivos de imagem.');
            return;
        }

        // Mostrar loading
        this.setState(prevState => ({ ...prevState, loading: true }));

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await this.post<any, FormData>(`/images/upload?folder=nominees`, formData, {
                'Content-Type': 'multipart/form-data'
            });

            if (!response || !response.data || !response.data.success) {
                throw new Error('Falha no upload da imagem');
            }

            const result = response.data;
            const imageUrl = result.data?.url || result.data?.relativePath;

            // Atualiza o estado com a URL da imagem
            this.setState(prevState => ({
                ...prevState,
                loading: false,
                formData: {
                    ...prevState.formData,
                    [fieldKey]: imageUrl
                }
            }));
        } catch (error) {
            console.error('Erro no upload:', error);
            alert('Erro ao fazer upload da imagem. Tente novamente.');
            this.setState(prevState => ({ ...prevState, loading: false }));
        }
    }

    protected handlePermissions(){
        this.setState(prevState => {
            const formData = prevState.formData as any; // Fazemos um cast rápido para acessar os dados crus

            if (formData && Array.isArray(formData.permissions)) {
                return {
                    ...prevState,
                    formData: {
                        ...prevState.formData,
                        // Mapeia o array de objetos pegando apenas o ID convertido para string
                        permissions: formData.permissions.map((p: Permission) => String(p.id))
                    }
                };
            }
            return prevState;
        });
    }

    protected renderForm(schema: F): React.ReactNode {
        if (!this.state.formData) {
            return null
        }
        return this.typedEntries(schema).map(([key, field]) => {
            const fieldKey = key as keyof T;
            // Usa 'any' aqui pontualmente ou string para evitar erro de indexação,
            // mas mantendo a segurança do T no state
            const value = this.state.formData[fieldKey];
            let inputElement: JSX.Element;

            if (field) {
                const isReadonly = field.readonly || false;
                const disabledClass = isReadonly ? "disabled" : "";
                switch (field.type) {
                    case 'textarea':
                        inputElement = <textarea
                            id={key as string}
                            value={String(value)}
                            onChange={this.handleChange}
                            disabled={isReadonly}
                            className={disabledClass}
                        />
                        break
                    case 'select':
                        inputElement = (
                            <select
                                id={key as string}
                                value={String(value)}
                                onChange={this.handleChange}
                                disabled={isReadonly}
                                className={disabledClass}
                            >
                                <option
                                    value=""
                                    disabled
                                >
                                    Selecione...
                                </option>
                                {field.options?.map(option => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        );
                        break;
                    case 'date':
                        inputElement = <input
                            id={key as string}
                            value={String(value)}
                            type="date"
                            onChange={this.handleChange}
                            disabled={isReadonly}
                            className={disabledClass}
                        />;
                        break;
                    case 'multiselect':
                        // Garante que o value seja um array para o React não reclamar
                    {
                        const arrayValue = Array.isArray(value) ? value.map(String) : [];

                        inputElement = (
                            <div
                                style={isReadonly ? { pointerEvents: 'none', opacity: 0.7 } : {}}
                                className={disabledClass}
                            >
                                <MultiSelect
                                    id={key as string}
                                    options={field.options}
                                    value={arrayValue}
                                    onChange={(newSelectedValue) =>this.handleMultiSelectChange(key as string, newSelectedValue)}
                                />
                            </div>
                        );
                        break;
                    }
                    case 'image':
                    {
                        const imageUrl = value as string | null | undefined;
                        const fullImageUrl = imageUrl && !imageUrl.startsWith('http')
                            ? `${API_URL}${imageUrl}`
                            : imageUrl;

                        inputElement = (
                            <div className={`image-upload-field ${disabledClass}`}>
                                {fullImageUrl && (
                                    <div className="image-preview">
                                        <img
                                            src={fullImageUrl}
                                            alt="Preview"
                                        />
                                    </div>
                                )}
                                <input
                                    id={key as string}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => this.handleImageUpload(e, key as string)}
                                    style={{ marginTop: '5px' }}
                                    disabled={isReadonly}
                                    className={disabledClass}
                                />
                            </div>
                        );
                        break;
                    }
                    case 'dynamic-list': { // 🔥 NOVO CASE AQUI
                        const arrayValue = Array.isArray(value) ? value.map(String) : [];

                        inputElement = (
                            <div className={disabledClass}>
                                <DynamicListInput
                                    id={key as string}
                                    value={arrayValue}
                                    onChange={(id, newArray) => this.handleMultiSelectChange(id, newArray)}
                                    disabled={isReadonly}
                                />
                            </div>
                        );
                        break;
                    }
                    case 'icon':
                        inputElement = (
                            <div
                                style={isReadonly ? { pointerEvents: 'none', opacity: 0.7 } : {}}
                                className={disabledClass}
                            >
                                <IconInput
                                    id={key as string}
                                    value={value ? String(value): ''}
                                    onChange={this.handleChange}
                                />
                            </div>
                        )
                        break
                    case 'number':
                        inputElement = <input
                            id={key as string}
                            value={Number(value)}
                            type={"number"}
                            onChange={this.handleChange}
                            disabled={isReadonly}
                            className={disabledClass}
                        />
                        break
                    case 'color':
                        inputElement = <input
                            id={key as string}
                            value={value as string}
                            onChange={this.handleChange}
                            type="color"
                            disabled={isReadonly}
                            className={disabledClass}
                        />
                        break
                    case 'text':
                    default:
                        inputElement = <input
                            id={key as string}
                            value={String(value)}
                            onChange={this.handleChange}
                            disabled={isReadonly}
                            className={disabledClass}
                        />;
                        break;
                }
                return (
                    <div className="section" key={key as string}>
                        <label htmlFor={key as string}>{field.label}</label>
                        {inputElement}
                    </div>
                )
            } else {
                return null
            }
        })
    }

    protected headerActions(): React.ReactNode {
        return null
    }

    protected abstract getFormSchema(): F;

    protected abstract handleSubmit(): Promise<void>;

    protected renderContent(): React.ReactNode {
        const schema = this.getFormSchema();
        if (!schema) {
            return null;
        }
        return (
            <div className="form-wrapper">
                <div className="form-header">
                    <h1>{this.state.title}</h1>
                    {this.headerActions() != null && (
                        <div className="header-actions">
                            {this.headerActions()}
                        </div>
                    )}
                </div>
                <main className='fields'>
                    {this.renderForm(schema)}
                    <button
                        className="btn create"
                        // Botão desabilita se estiver carregando (herdado de BaseState)
                        disabled={this.state.loading}
                        onClick={() => this.handleSubmit()}
                    >
                        {this.state.loading ? "Salvando..." : "Salvar"}
                    </button>
                </main>
            </div>
        )
    }
}