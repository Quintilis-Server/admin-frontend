import type { FormSchema, FormState } from "../../../types/FormOption.ts";
import type { PageState } from "../../../types/PageTypes.ts";
import { BaseCreationPage } from "../../BaseCreationPage.tsx";
import {API_FORUM_ROUTES, AUTH_URL} from "../../../Consts.ts";
import type {Permission} from "../../../types/RoleTypes.ts";

type CategoryData = {
    title: string,
    slug: string,
    description: string,
    displayOrder: number,
    permissions?: number
}

const CATEGORY_FORM_SCHEMA: FormSchema<CategoryData> = {
    title: { label: "Titulo", type: "text" },
    slug: { label: "Slug", type: "text" },
    description: { label: "Descrição", type: "textarea" },
    displayOrder: { label: "Ordem de mostragem", type: "number" },
    permissions: { label: "Permissão para Criar Tópico", type: "multiselect", options: [] }
}

export class CategoryCreationPage extends BaseCreationPage<CategoryData, typeof CATEGORY_FORM_SCHEMA, object, FormState<CategoryData>> {
    protected getReturnURL(): string {
        return "/forum/category"
    }
    protected getResourceName(): string {
        return `${API_FORUM_ROUTES}/category`;
    }

    protected getFormSchema(): typeof CATEGORY_FORM_SCHEMA {
        return CATEGORY_FORM_SCHEMA;
    }

    state: FormState<CategoryData> & PageState = {
        formData: {
            title: "",
            slug: "",
            description: "",
            displayOrder: 0
        },
        title: "Nova Categoria",
        err: undefined,
        loading: false
    }

    async componentDidMount() {
        try {
            const response = await this.get<Permission[]>(`${AUTH_URL}/auth/permissions/all`);
            if (response && response.data && response.data.success) {
                const permissions = response.data.data;
                const options = [
                    { label: "Nenhuma (Público)", value: "" },
                    ...permissions.map((p: Permission) => ({
                        label: p.name,
                        value: String(p.id)
                    }))
                ];

                // Hack: Modifying schema options dynamically
                CATEGORY_FORM_SCHEMA.permissions!.options = options;
                this.forceUpdate();
            }
        } catch (e) {
            console.error("Failed to load permissions", e);
        }
    }
}