import type {FormSchema, FormState} from "../types/FormOption.ts";
import type {BaseProps} from "../types/PageTypes.ts";
import {BasePage} from "./BasePage.tsx";
import type {ChangeEvent, JSX} from "react";
import {API_URL} from "../Consts.ts";
import "../stylesheet/FormStyle.scss"

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

    protected handleMultiSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { id, options } = e.target;
        const selectedValues: string[] = [];

        // Percorre as opções e pega todas que estão selecionadas
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }

        this.setState(prevState => ({
            ...prevState,
            formData: {
                ...prevState.formData,
                [id]: selectedValues // Salva como Array de strings
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

            //TODO colocar o metodo real aq para post para a API logada
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
                switch (field.type) {
                    case 'textarea':
                        inputElement = <textarea id={key as string} value={String(value)} onChange={this.handleChange} />
                        break
                    case 'select':
                        inputElement = (
                            <select id={key as string} value={String(value)} onChange={this.handleChange}>
                                <option value="" disabled>Selecione...</option>
                                {field.options?.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        );
                        break;
                    case 'date':
                        inputElement = <input id={key as string} value={String(value)} type="date" onChange={this.handleChange} />;
                        break;
                    case 'readonly':
                        inputElement = (
                            <input
                                id={key as string}
                                value={String(value)}
                                type="text"
                                disabled
                                style={{ backgroundColor: "#e9ecef", cursor: "not-allowed", color: '#6c757d' }}
                            />
                        )
                        break;
                    case 'multiselect':
                        // Garante que o value seja um array para o React não reclamar
                    {
                        const arrayValue = Array.isArray(value) ? value.map(String) : [];

                        inputElement = (
                            <select
                                id={key as string}
                                multiple // Permite selecionar vários (segure Ctrl/Cmd)
                                value={arrayValue}
                                onChange={this.handleMultiSelectChange}
                                style={{ height: '120px' }} // Altura maior para ver a lista
                            >
                                {field.options?.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
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
                            <div className="image-upload-field">
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
                                />
                            </div>
                        );
                        break;
                    }
                    case 'number':
                        inputElement = <input id={key as string} value={Number(value)} type={"number"} onChange={this.handleChange}/>
                        break
                    case 'text':
                    default:
                        inputElement = <input id={key as string} value={String(value)} onChange={this.handleChange} />;
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
                    <div className="header-actions">
                        {this.headerActions()}
                    </div>
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