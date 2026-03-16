import {BaseCreationPage} from "../../BaseCreationPage.tsx";
import type {FormSchema, FormState} from "../../../types/FormOption.ts";
import {API_AUTH_ROUTES} from "../../../Consts.ts";
import type {Permission} from "../../../types/RoleTypes.ts";

type RoleEditData = {
    name: string;
    displayName: string;
    color: string;
    priority: number;
    permissionIds: string[]; // Usado para o multiselect
}

const ROLE_FORM_SCHEMA: FormSchema<RoleEditData> = {
    name: {label: "Nome", type: "text", readonly: false},
    displayName: {label: "Nome exibido", type: "text", readonly: false},
    color: {label: "Cor", type: "color", readonly: false},
    priority: {label: "Prioridade", type: "number", readonly: false},
    permissionIds: { type: 'multiselect', label: 'Permissões', readonly: false, options: [] }
}
export class RoleCreationPage extends BaseCreationPage<RoleEditData, typeof ROLE_FORM_SCHEMA> {
    state: FormState<RoleEditData> = {
        formData: {
            name: "",
            displayName: "",
            color: "",
            priority: 0,
            permissionIds: []
        },
        loading: false,
        title: "Novo Role"

    }

    protected getReturnURL(): string {
        return "/roles"
    }

    protected getResourceName(): string {
        return `${API_AUTH_ROUTES}/role`
    }

    protected getFormSchema(): FormSchema<RoleEditData> {
        return ROLE_FORM_SCHEMA
    }

    async componentDidMount() {
        try {
            const response = await this.get<Permission[]>(`${API_AUTH_ROUTES}/permissions/list`);
            if (response && response.data && response.data.success) {
                const permissions = response.data.data;
                const options = [
                    { label: "Nenhuma (Público)", value: "" },
                    ...permissions.map((p: { id: number, name: string }) => ({
                        label: p.name,
                        value: String(p.id)
                    }))
                ];

                // Hack: Modifying schema options dynamically
                ROLE_FORM_SCHEMA.permissionIds!.options = options;
                this.forceUpdate();
            }
        } catch (e) {
            console.error("Failed to load permissions", e);
        }
    }

}