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
    permissionIds: string[]; // Usado para o multiselect
}

const ROLE_FORM_SCHEMA: FormSchema<RoleEditData> = {
    id: { type: 'readonly', label: 'ID' },
    name: { type: 'text', label: 'Nome Interno' },
    displayName: { type: 'text', label: 'Nome de Exibição' },
    color: { type: 'color', label: 'Cor (Hex)' },
    priority: { type: 'number', label: 'Prioridade' },
    permissionIds: { type: 'multiselect', label: 'Permissões', options: [] }
}

export class RoleEditPage extends BaseEditPage<RoleEditData, typeof ROLE_FORM_SCHEMA> {

    constructor(props: EditPageProps) {
        super(props, {
            formData: {
                id: 0,
                name: "",
                displayName: "",
                color: "",
                priority: 0,
                permissionIds: []
            },
            title: "Editar Role",
            err: undefined,
            loading: true
        });
    }

    protected getResourceName(): string {
        return "auth/role";
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
        this.executeAsync(async ()=>{
            try {
                const [roleRes, permsRes] = await Promise.all([
                    this.get<Role>(`${AUTH_URL}/auth/roles/${id}`),
                    this.get<Permission[]>(`${AUTH_URL}/auth/permissions/all`)
                ]);

                const roleData = roleRes.data;
                const permsData = permsRes.data;

                if (!roleData.success || !permsData.success) {
                    throw new Error("Falha na chamada da API.");
                }

                const role = roleData.data as unknown as Role;
                const allPerms = permsData.data as unknown as Permission[];

                const schema = this.getFormSchema();
                schema.permissionIds.options = allPerms.map(p => ({
                    label: p.name + (p.description ? ` - ${p.description}` : ""),
                    value: String(p.id)
                }));

                // Map das permissões da Role (string) para os IDs
                const permissionIds = role.permissions.map(permName => {
                    const p = allPerms.find(ap => ap.name === permName);
                    return p ? String(p.id) : null;
                }).filter(id => id !== null) as string[];

                this.setState(prevState => ({
                    ...prevState,
                    formData: {
                        id: role.id,
                        name: role.name,
                        displayName: role.displayName,
                        color: role.color,
                        priority: role.priority,
                        permissionIds
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
            const role: RoleEditData = this.state.formData
            role.permissionIds = this.state.formData.permissionIds.map(String);
            console.log(role)
            await this.put<Role, RoleEditData>(`${AUTH_URL}/auth/roles/${id}`, role)
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
