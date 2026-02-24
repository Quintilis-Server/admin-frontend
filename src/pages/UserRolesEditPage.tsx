import { BasePage } from "./BasePage.tsx";
import type { BaseProps, PageState } from "../types/PageTypes.ts";
import type { Role, UserWithRoles } from "../types/RoleTypes.ts";
import * as React from "react";
import { AUTH_URL } from "../Consts.ts";
import axios from "axios";
import "../stylesheet/RolesPageStyle.scss"

type UserRolesEditState = PageState & {
    user: UserWithRoles | null;
    allRoles: Role[];
    selectedRoleIds: Set<number>;
    saving: boolean;
    successMessage: string | null;
}

export class UserRolesEditPage extends BasePage<BaseProps, UserRolesEditState> {
    state: UserRolesEditState = {
        user: null,
        allRoles: [],
        selectedRoleIds: new Set(),
        saving: false,
        successMessage: null,
        loading: true,
        title: "Editar Roles do Usuário",
        err: undefined
    }

    private getUserId(): string {
        const parts = window.location.pathname.split('/');
        // URL format: /users/:id/roles → parts = ["", "users", ":id", "roles"]
        return parts[2];
    }

    async componentDidMount() {
        super.componentDidMount();
        try {
            const userId = this.getUserId();
            const [userRes, rolesRes] = await Promise.all([
                this.get<UserWithRoles>(`${AUTH_URL}/auth/users/${userId}`),
                this.get<Role[]>(`${AUTH_URL}/auth/roles`)
            ]);

            const user = userRes.data as unknown as UserWithRoles;
            const allRoles = rolesRes.data as unknown as Role[];

            const selectedIds = new Set<number>(
                user.roles.map(r => r.id)
            );

            this.setState({
                user,
                allRoles,
                selectedRoleIds: selectedIds,
                loading: false,
                title: `Roles - ${user.username}`
            });
        } catch (e) {
            console.error("Erro ao carregar user:", e);
            this.setState({ loading: false });
        }
    }

    private toggleRole(roleId: number) {
        this.setState(prev => {
            const newSet = new Set(prev.selectedRoleIds);
            if (newSet.has(roleId)) {
                newSet.delete(roleId);
            } else {
                newSet.add(roleId);
            }
            return { selectedRoleIds: newSet, successMessage: null };
        });
    }

    private async handleSave() {
        if (!this.state.user) return;
        this.setState({ saving: true, successMessage: null });

        try {
            const roleIds = Array.from(this.state.selectedRoleIds);
            await axios.put(
                `${AUTH_URL}/auth/users/${this.state.user.id}/roles`,
                roleIds,
                { headers: { "Content-Type": "application/json" } }
            );
            this.setState({ saving: false, successMessage: "Roles salvos com sucesso!" });
        } catch (e) {
            console.error("Erro ao salvar:", e);
            this.setState({ saving: false });
        }
    }

    protected renderContent(): React.ReactNode {
        if (this.state.loading || !this.state.user) {
            return <div className="user-roles-edit-page container"><div className="loading-spinner">Carregando...</div></div>;
        }

        const user = this.state.user;

        return (
            <div className="user-roles-edit-page container">
                <div className="page-header">
                    <h1>Editar Roles</h1>
                    <a className="back-link" href="/users">← Voltar para Users</a>
                </div>

                <div className="user-info-card">
                    <div className="user-avatar">
                        {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                        <div className="user-name">{user.username}</div>
                        <div className="user-email">{user.email}</div>
                    </div>
                </div>

                <div className="roles-selection">
                    <h2>Roles</h2>
                    <div className="role-toggle-list">
                        {this.state.allRoles.map(role => (
                            <div
                                key={role.id}
                                className={`role-toggle-item ${this.state.selectedRoleIds.has(role.id) ? 'active' : ''}`}
                                onClick={() => this.toggleRole(role.id)}
                            >
                                <label className="toggle-switch" onClick={e => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={this.state.selectedRoleIds.has(role.id)}
                                        onChange={() => this.toggleRole(role.id)}
                                    />
                                    <span className="slider"></span>
                                </label>
                                <div className="role-toggle-info">
                                    <span className="role-badge" style={{ backgroundColor: role.color }}>
                                        {role.icon && <span>{role.icon}</span>}
                                        {role.name}
                                    </span>
                                    <span className="role-name">{role.displayName}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    className="save-button"
                    disabled={this.state.saving}
                    onClick={() => this.handleSave()}
                >
                    {this.state.saving ? "Salvando..." : "Salvar Roles"}
                </button>

                {this.state.successMessage && (
                    <div className="success-message">{this.state.successMessage}</div>
                )}
            </div>
        );
    }
}
