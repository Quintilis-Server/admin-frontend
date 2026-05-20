import {BaseEditPage, type EditPageProps} from "../../BaseEditPage.tsx";
import { invalidateRoutesCache } from "../../../context/RouteContext.tsx";
import type {FrontendRoute} from "../../../types/FrontendRoute.ts";
import type {FormSchema} from "../../../types/FormOption.ts";
import {API_AUTH_ROUTES} from "../../../Consts.ts";
import type {Permission} from "../../../types/RoleTypes.ts";

const FORM_SCHEMA: FormSchema<FrontendRoute> = {
    id: {label: "Id", type: "text", readonly: true},
    path: {label:"Caminho (Path)", type:"text", readonly: false},
    permissions: {label: "Permissões Exigidas", type: "multiselect", readonly: false},
    description: {label: "Descrição", type: "text", readonly: false},
}

export class FrontendRoutesEditPage extends BaseEditPage<FrontendRoute, typeof FORM_SCHEMA> {
    constructor(props: EditPageProps) {
        super(props, {
            formData: {
                id: "",
                path: "",
                permissions: [],
                description: "",
            },
            title: "Editar Tela do Frontend",
            err: undefined,
            loading: true
        })
    }

    protected getResourceName(): string {
        return `${API_AUTH_ROUTES}/frontend-routes`;
    }

    protected getReturnURL(): string {
        return "auth/frontend-routes"
    }

    protected getFormSchema(): typeof FORM_SCHEMA {
        return FORM_SCHEMA;
    }

    protected async fetchDataToEdit() {
        await super.fetchDataToEdit();
        super.handlePermissions()
    }
    
    async componentDidMount() {
        await super.componentDidMount();
        try {
            const response = await this.get<Permission[]>(`${API_AUTH_ROUTES}/permissions/list`);
            if (response && response.data && response.data.success) {
                const permissions = response.data.data;
                const options = [
                    { label: "Nenhuma (Público)", value: "" },
                    ...permissions
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((p: { id: number, name: string }) => ({
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

    override async handleSubmit() {
        const payloadParaOBackend = {
            ...this.state.formData
        };

        payloadParaOBackend.permissions = (this.state.formData.permissions as any[]).map((perm: any) => {
            if (typeof perm === 'string' || typeof perm === 'number') {
                return {
                    id: parseInt(String(perm), 10),
                    name: "",
                    description: ""
                };
            }
            return {
                id: perm.id,
                name: perm.name || "",
                description: perm.description || ""
            };
        }) as unknown as Permission[];

        await this.executeAsync(async () => {
            await this.post(`${this.getResourceName()}/${this.state.formData.id}/update`, payloadParaOBackend);
            invalidateRoutesCache();
            window.location.href = `/${this.getReturnURL()}`;
        });
    }
}
