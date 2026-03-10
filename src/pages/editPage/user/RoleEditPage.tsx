import type { FormSchema } from "../../../types/FormOption.ts";
import { BaseEditPage, type EditPageProps } from "../../BaseEditPage.tsx";
import type { Permission, Role } from "../../../types/RoleTypes.ts";
import { AUTH_URL } from "../../../Consts.ts";
import { BaseException } from "../../../exceptions/BaseException.ts";
import { ErrorCode } from "../../../types/ApiResponseType.ts";

type RoleEditData = {
    id: number;
    name: string;
    displayName: string;
    color: string;
    priority: number;
    permissions: Permission[]; // Usado para o multiselect
    icon: string;
}

const ROLE_FORM_SCHEMA: FormSchema<RoleEditData> = {
    id: { type: 'text', label: 'ID', readonly: true },
    name: { type: 'text', label: 'Nome Interno', readonly: false },
    displayName: { type: 'text', label: 'Nome de Exibição', readonly: false },
    color: { type: 'color', label: 'Cor (Hex)', readonly: false },
    priority: { type: 'number', label: 'Prioridade', readonly: false },
    permissions: { type: 'multiselect', label: 'Permissões', readonly: false, options: [] },
    icon: {type: 'icon', label: 'Icone', readonly: false},
}

export class RoleEditPage extends BaseEditPage<RoleEditData, typeof ROLE_FORM_SCHEMA> {
    protected getReturnURL(): string {
        return "/roles"
    }

    constructor(props: EditPageProps) {
        super(props, {
            formData: {
                id: 0,
                name: "",
                displayName: "",
                color: "",
                priority: 0,
                permissions: [],
                icon: ""
            },
            title: "Editar Role",
            err: undefined,
            loading: true
        });
    }

    protected getResourceName(): string {
        return "role";
    }

    protected getFormSchema(): typeof ROLE_FORM_SCHEMA {
        return ROLE_FORM_SCHEMA;
    }

    canDelete(): boolean {
        return false; // Roles não podem ser deletadas pela UI atual do admin
    }

    protected async fetchDataToEdit() {
        const id = this.props.params.id;
        if (!id) return;
        await this.executeAsync(async () => {
            try {
                const [roleRes, permsRes] = await Promise.all([
                    this.get<Role>(`${AUTH_URL}/roles/${id}`),
                    this.get<Permission[]>(`${AUTH_URL}/permissions/list`)
                ]);

                const roleData = roleRes.data;
                const permsData = permsRes.data;

                if (!roleData.success || !permsData.success) {
                    throw new Error("Falha na chamada da API.");
                }

                const role = roleData.data as unknown as Role;
                const allPerms = permsData.data as unknown as Permission[];

                const schema = this.getFormSchema();
                schema.permissions.options = allPerms.map(p => ({
                    label: p.name + (p.description ? ` - ${p.description}` : ""),
                    value: String(p.id)
                }));

                this.setState(prevState => ({
                    ...prevState,
                    formData: {
                        id: role.id,
                        name: role.name,
                        displayName: role.displayName,
                        color: role.color,
                        priority: role.priority,
                        permissions: role.permissions,
                        icon: role.icon,
                    },
                    loading: false,
                    title: `Editar Role - ${role.displayName}`
                }));

                this.forceUpdate();
            } catch (e) {
                this.setState({
                    err: e instanceof BaseException ? e : new BaseException(ErrorCode.UNKNOWN_ERROR, "Erro ao carregar dados")
                });
            }
        })
    }

    protected async handleSubmit() {
        const id = this.props.params.id;
        if (!id) return;

        this.setState({ loading: true, err: undefined });

        try {
            const payloadParaOBackend = {
                ...this.state.formData,
            }

            payloadParaOBackend.permissions = this.state.formData.permissions.map((perm: any) => {
                if (typeof perm === "string" || typeof perm === "number") {
                    return {
                        id: parseInt(String(perm), 10),
                        name: "",
                        description: ""
                    }
                }

                return {
                    id: perm.id,
                    name: perm.name || "",
                    description: perm.description || ""
                }
            }) as unknown as Permission[];

            await this.post<Role, RoleEditData>(`${AUTH_URL}/roles/${id}/update`, payloadParaOBackend);
            // await axios.put(
            //     `${AUTH_URL}/auth/roles/${id}/permissions`,
            //     permissionIds,
            //     { headers: { "Content-Type": "application/json" } }
            // );



            alert("Role atualizado com sucesso");
            window.location.href = `/roles`;
        } catch (e) {
            this.setState({
                err: e instanceof BaseException ? e : new BaseException(ErrorCode.UNKNOWN_ERROR, "Erro ao salvar permissões"),
                loading: false
            });
        }
    }
}
