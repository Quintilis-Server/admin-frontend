import type { FormSchema } from "../../../types/FormOption.ts";
import { BaseEditPage, type EditPageProps } from "../../BaseEditPage.tsx";
import type { Role, UserWithRoles } from "../../../types/RoleTypes.ts";
import { AUTH_URL } from "../../../Consts.ts";
import axios from "axios";
import { BaseException } from "../../../exceptions/BaseException.ts";
import { ErrorCode } from "../../../types/ApiResponseType.ts";

type UserRolesEditData = {
    id: string;
    username: string;
    email: string;
    roleIds: string[]; // Para uso no multiselect
}

const USER_ROLES_FORM_SCHEMA: FormSchema<UserRolesEditData> = {
    id: { type: 'readonly', label: 'ID' },
    username: { type: 'readonly', label: 'Nome de Usuário' },
    email: { type: 'readonly', label: 'Email' },
    roleIds: { type: 'multiselect', label: 'Roles', options: [] }
}

export class UserRolesEditPage extends BaseEditPage<UserRolesEditData, typeof USER_ROLES_FORM_SCHEMA> {

    constructor(props: EditPageProps) {
        super(props, {
            formData: {
                id: "",
                username: "",
                email: "",
                roleIds: []
            },
            title: "Editar Roles do Usuário",
            err: undefined,
            loading: true
        });
    }

    protected getResourceName(): string {
        return "auth/users";
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
                axios.get<UserWithRoles>(`${AUTH_URL}/auth/users/${id}`),
                this.get<Role[]>(`${AUTH_URL}/auth/roles`) // este tem ApiResponse
            ]);

            const user = userRes.data;
            const rolesData = rolesRes.data;

            if (!rolesData.success) {
                throw new Error("Falha na chamada da API de Roles.");
            }

            const allRoles = rolesData.data as unknown as Role[];

            const schema = this.getFormSchema();
            schema.roleIds.options = allRoles.map(r => ({
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
                    roleIds
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
            const roleIds = this.state.formData.roleIds.map(Number);

            await axios.put(
                `${AUTH_URL}/auth/users/${id}/roles`,
                roleIds,
                { headers: { "Content-Type": "application/json" } }
            );

            alert("Roles do usuário atualizadas com sucesso!");
            window.location.href = `/users`;
        } catch (e) {
            this.setState({
                err: e instanceof BaseException ? e : new BaseException(ErrorCode.UNKNOWN_ERROR, "Erro ao salvar roles"),
                loading: false
            });
        }
    }
}
