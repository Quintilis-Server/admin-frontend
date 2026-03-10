import {BaseEditPage, type EditPageProps} from "../BaseEditPage.tsx";
import type {RouteRule} from "../../types/RouteRule.ts";
import type {FormSchema} from "../../types/FormOption.ts";
import {AUTH_URL} from "../../Consts.ts";
import type {Permission} from "../../types/RoleTypes.ts";

const ROUTES_FORM_SCHEMA: FormSchema<RouteRule> = {
    id: {label: "Id", type: "text", readonly: true},
    urlPattern: {label:"Padrão URL", type:"text", readonly: true},
    httpMethod: {label: "Método HTTP", type: "text", readonly: true},
    serviceName: {label: "Service Name", type: "text", readonly: true},
    permissions: {label: "Permissões", type: "multiselect", readonly: false},
    description: {label: "Description", type: "text", readonly: false},
}

export class RoutesEditPage extends BaseEditPage<RouteRule, typeof ROUTES_FORM_SCHEMA> {
    constructor(props: EditPageProps) {
        super(props, {
            formData: {
                id: "",
                urlPattern: "",
                httpMethod: "",
                serviceName: "",
                permissions: [],
                description: "",
            },
            title: "Editar Permissão",
            err: undefined,
            loading: true
        })
    }

    protected getResourceName(): string {
        return `${AUTH_URL}/routes`;
    }

    protected getReturnURL(): string {
        return "routes"
    }

    protected getFormSchema(): typeof ROUTES_FORM_SCHEMA {
        return ROUTES_FORM_SCHEMA;
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
            const response = await this.get<Permission[]>(`${AUTH_URL}/permissions/list`);
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

        // 1. Fazemos uma cópia dos dados atuais do formulário
        const payloadParaOBackend = {
            ...this.state.formData
        };


        payloadParaOBackend.permissions = (this.state.formData.permissions as any[]).map((perm: any) => {

            // CENÁRIO 1: O usuário mexeu no select, então o HTML transformou em String (ex: "9")
            if (typeof perm === 'string' || typeof perm === 'number') {
                return {
                    id: parseInt(String(perm), 10),
                    name: "",
                    description: ""
                };
            }

            // CENÁRIO 2: O usuário não tocou no campo, então ele continua sendo o objeto original
            return {
                id: perm.id,
                name: perm.name || "",
                description: perm.description || ""
            };

        }) as unknown as Permission[];

        // 3. Envia para o backend (ajuste a chamada abaixo conforme a sua BaseEditPage faz)
        await this.executeAsync(async () => {
            await this.post(`${this.getResourceName()}/${this.state.formData.id}/update`, payloadParaOBackend);

            // Redireciona de volta após salvar com sucesso
            window.location.href = `/${this.getReturnURL()}`;
        });
    }
}