import type { FormSchema } from "../../../types/FormOption.ts";
import { BaseEditPage, type EditPageProps } from "../../BaseEditPage.tsx";
import {API_FORUM_ROUTES, AUTH_URL} from "../../../Consts.ts";
import type {Permission} from "../../../types/RoleTypes.ts";
import type {Category} from "../../../types/ForumTypes.ts";
import {BaseException} from "../../../exceptions/BaseException.ts";
import {ErrorCode} from "../../../types/ApiResponseType.ts";

type CategoryData = {
    title: string,
    slug: string,
    description: string,
    displayOrder: number,
    permissions?: string[]
}

const CATEGORY_FORM_SCHEMA: FormSchema<CategoryData> = {
    title: { label: "Titulo", type: "text" },
    slug: { label: "Slug", type: "text" },
    description: { label: "Descrição", type: "textarea" },
    displayOrder: { label: "Ordem de mostragem", type: "number" },
    permissions: { label: "Permissões para Criar Tópico", type: "multiselect", options: [] }
}

export class CategoryEditPage extends BaseEditPage<CategoryData, typeof CATEGORY_FORM_SCHEMA> {

    constructor(props: EditPageProps) {
        super(props, {
            formData: {
                title: "",
                slug: "",
                description: "",
                displayOrder: 0
            },
            title: "Editar Categoria",
            err: undefined,
            loading: true
        });
    }

    protected getResourceName(): string {
        return `${API_FORUM_ROUTES}/category`;
    }

    protected getReturnURL(): string {
        return "/forum/category"
    }

    protected getFormSchema(): typeof CATEGORY_FORM_SCHEMA {
        return CATEGORY_FORM_SCHEMA;
    }
    protected async fetchDataToEdit() {
        // 1. Puxa os dados originais da API (que vêm no formato da interface Category)
        await super.fetchDataToEdit();

        // 2. Transforma o Permission[] em string[] com os IDs
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

    async componentDidMount() {
        super.componentDidMount();
        try {
            const response = await this.get<Permission[]>(`${AUTH_URL}/auth/permissions/all`);
            if (response && response.data && response.data.success) {
                const permissions = response.data.data;
                const options = [
                    { label: "Nenhuma (Público)", value: "" },
                    ...permissions.map((p: { id: number, name: string }) => ({
                        label: p.name,
                        value: String(p.id)
                    }))
                ];

                const currentSchema = this.getFormSchema();
                if (currentSchema.permissions) {
                    currentSchema.permissions.options = options;
                    this.forceUpdate();
                }
            }
        } catch (e) {
            console.error("Failed to load permissions", e);
        }
    }

    async handleSubmit(){
        const id = this.props.params.id;

        if (!id) return;

        try {
            const response = await this.put<Category, CategoryData>(`${this.getResourceName()}/${id}/update`, this.state.formData)
            if (!response || !response.data || !response.data.success) throw BaseException.fromResponse(response.data)

            alert("Atualizado com sucesso!")
            window.location.href = `${this.getReturnURL()}`
        } catch (e) {
            console.error(e instanceof BaseException)
            this.setState({
                err: e instanceof BaseException ? e : new BaseException(ErrorCode.UNKNOWN_ERROR, "Erro ao atualizar")
            })
        }
    }
}
