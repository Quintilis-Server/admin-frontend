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
    title: { label: "Titulo", type: "text", readonly: false },
    slug: { label: "Slug", type: "text", readonly: false },
    description: { label: "Descrição", type: "textarea", readonly: false },
    displayOrder: { label: "Ordem de mostragem", type: "number", readonly: false },
    permissions: { label: "Permissões para Criar Tópico", type: "multiselect", readonly: false, options: [] }
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
        return `${API_FORUM_ROUTES}/categories`;
    }

    protected getReturnURL(): string {
        return "/forum/categories"
    }

    protected getFormSchema(): typeof CATEGORY_FORM_SCHEMA {
        return CATEGORY_FORM_SCHEMA;
    }
    protected async fetchDataToEdit() {
        // 1. Puxa os dados originais da API (que vêm no formato da interface Category)
        await super.fetchDataToEdit();

        // 2. Transforma o Permission[] em string[] com os IDs
        super.handlePermissions()
    }

    async componentDidMount() {
        await super.componentDidMount();
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
