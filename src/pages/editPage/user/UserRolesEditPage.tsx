import type { FormSchema } from "../../../types/FormOption.ts";
import { BaseEditPage, type EditPageProps } from "../../BaseEditPage.tsx";
import type { Role, UserWithRoles } from "../../../types/RoleTypes.ts";
import { API_AUTH_ROUTES } from "../../../Consts.ts";
import axios from "axios";
import { BaseException } from "../../../exceptions/BaseException.ts";
import { ErrorCode } from "../../../types/ApiResponseType.ts";

type UserRolesEditData = {
    id: string;
    username: string;
    email: string;
    roles: string[]; // Para uso no multiselect
}

const USER_ROLES_FORM_SCHEMA: FormSchema<UserRolesEditData> = {
    id: { type: 'text', label: 'ID', readonly: true },
    username: { type: 'text', label: 'Nome de Usuário', readonly: true },
    email: { type: 'text', label: 'Email', readonly: true },
    roles: { type: 'multiselect', label: 'Roles', readonly: false, options: [] }
}

export class UserRolesEditPage extends BaseEditPage<UserRolesEditData, typeof USER_ROLES_FORM_SCHEMA> {
    protected getReturnURL(): string {
        return "/users"
    }

    constructor(props: EditPageProps) {
        super(props, {
            formData: {
                id: "",
                username: "",
                email: "",
                roles: []
            },
            title: "Editar Roles do Usuário",
            err: undefined,
            loading: true
        });
    }

    protected getResourceName(): string {
        return "/users";
    }

    protected getFormSchema(): typeof USER_ROLES_FORM_SCHEMA {
        return USER_ROLES_FORM_SCHEMA;
    }

    canDelete(): boolean {
        return false;
    }

    protected async fetchDataToEdit() {
        const id = this.props.params.id;
        if (!id) return;

        try {
            // /users/id não retorna ApiResponse, retorna direto a DTO (segundo o controller)
            // Mas o BaseComponent get() espera wrapper. Vamos usar axios direto para evitar warnings se nao tiver
            const [userRes, rolesRes] = await Promise.all([
                this.get<UserWithRoles>(`${API_AUTH_ROUTES}/users/${id}`),
                this.get<Role[]>(`${API_AUTH_ROUTES}/roles/list`) // este tem ApiResponse
            ]);

            const user = userRes.data.data;
            const rolesData = rolesRes.data;

            console.log(user, rolesData)

            if (!rolesData.success) {
                throw new Error("Falha na chamada da API de Roles.");
            }

            const allRoles = rolesData.data as unknown as Role[];

            const schema = this.getFormSchema();
            schema.roles.options = allRoles.map(r => ({
                label: `${r.displayName} (${r.name})`,
                value: String(r.id)
            }));

            // Map das roles atuais para seus IDs
            const roleIds = user.roles.map(r => String(r.id));

            this.setState(prevState => ({
                ...prevState,
                formData: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    roles: roleIds
                },
                loading: false,
                title: `Editar Usuário - ${user.username}`
            }));

            this.forceUpdate();
        } catch (e) {
            this.setState({
                err: e instanceof BaseException ? e : new BaseException(ErrorCode.UNKNOWN_ERROR, "Erro ao carregar dados")
            });
        }
    }

    protected async handleSubmit() {
        const id = this.props.params.id;
        if (!id) return;

        this.setState({ loading: true, err: undefined });

        try {
            const currentData = this.state.formData;

            // 2. Montamos o payload no exato formato do UserDTO do backend
            const payload = {
                id: currentData.id,
                username: currentData.username,
                email: currentData.email,
                // Transforma o array de strings ["1", "2"] em array de objetos [{ id: 1 }, { id: 2 }]
                roles: currentData.roles.map(roleId => ({ id: Number(roleId) }))
            };

            // 3. Enviamos o DTO completo para a rota de update
            await this.post(
                `${API_AUTH_ROUTES}/users/${id}/update`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );
            await this.post(
                `${API_AUTH_ROUTES}/users/${id}/update`,
                payload
            );

            alert("Roles do usuário atualizadas com sucesso!");
            window.location.href = `/users`;
        } catch (e) {
            if(axios.isAxiosError(e)) {
                this.setState({
                    err: BaseException.fromAxiosError(e),
                    loading: false
                });
                return
            }
            this.setState({
                err: e instanceof BaseException ? e : new BaseException(ErrorCode.UNKNOWN_ERROR, "Erro ao salvar roles"),
                loading: false
            });
        }
    }
}
