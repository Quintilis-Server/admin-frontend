import { BasePage } from "./BasePage.tsx";
import type { BaseProps, PageState } from "../types/PageTypes.ts";
import type { Permission, Role } from "../types/RoleTypes.ts";
import * as React from "react";
import { AUTH_URL } from "../Consts.ts";
import axios from "axios";
import "../stylesheet/RolesPageStyle.scss"

type RoleEditState = PageState & {
    role: Role | null;
    allPermissions: Permission[];
    selectedPermissionIds: Set<number>;
    saving: boolean;
    successMessage: string | null;
}

export class RoleEditPage extends BasePage<BaseProps, RoleEditState> {
    state: RoleEditState = {
        role: null,
        allPermissions: [],
        selectedPermissionIds: new Set(),
        saving: false,
        successMessage: null,
        loading: true,
        title: "Editar Role",
        err: undefined
    }

    private getRoleId(): string {
        const parts = window.location.pathname.split('/');
        return parts[parts.length - 1];
    }

    async componentDidMount() {
        super.componentDidMount();
        try {
            const roleId = this.getRoleId();
            const [roleRes, permsRes] = await Promise.all([
                this.get<Role>(`${AUTH_URL}/auth/roles/${roleId}`),
                this.get<Permission[]>(`${AUTH_URL}/auth/permissions`)
            ]);

            const role = roleRes.data as unknown as Role;
            const allPermissions = permsRes.data as unknown as Permission[];

            // Encontrar IDs das permissions que o role já tem
            const selectedIds = new Set<number>();
            allPermissions.forEach(p => {
                if (role.permissions.includes(p.name)) {
                    selectedIds.add(p.id);
                }
            });

            this.setState({
                role,
                allPermissions,
                selectedPermissionIds: selectedIds,
                loading: false,
                title: `Editar Role - ${role.displayName}`
            });
        } catch (e) {
            console.error("Erro ao carregar role:", e);
            this.setState({ loading: false });
        }
    }

    private togglePermission(permId: number) {
        this.setState(prev => {
            const newSet = new Set(prev.selectedPermissionIds);
            if (newSet.has(permId)) {
                newSet.delete(permId);
            } else {
                newSet.add(permId);
            }
            return { selectedPermissionIds: newSet, successMessage: null };
        });
    }

    private async handleSave() {
        if (!this.state.role) return;
        this.setState({ saving: true, successMessage: null });

        try {
            const permissionIds = Array.from(this.state.selectedPermissionIds);
            await axios.put(
                `${AUTH_URL}/auth/roles/${this.state.role.id}/permissions`,
                permissionIds,
                { headers: { "Content-Type": "application/json" } }
            );
            this.setState({ saving: false, successMessage: "Permissões salvas com sucesso!" });
        } catch (e) {
            console.error("Erro ao salvar:", e);
            this.setState({ saving: false });
        }
    }

    private groupPermissions(permissions: Permission[]): Record<string, Permission[]> {
        const groups: Record<string, Permission[]> = {};
        permissions.forEach(p => {
            const parts = p.name.split('.');
            const group = parts[0] || 'other';
            if (!groups[group]) groups[group] = [];
            groups[group].push(p);
        });
        return groups;
    }

    protected renderContent(): React.ReactNode {
        if (this.state.loading || !this.state.role) {
            return <div className="role-edit-page container"><div className="loading-spinner">Carregando...</div></div>;
        }

        const role = this.state.role;
        const groups = this.groupPermissions(this.state.allPermissions);

        return (
            <div className="role-edit-page container">
                <div className="page-header">
                    <h1>Editar Role</h1>
                    <a className="back-link" href="/roles">← Voltar para Roles</a>
                </div>

                <div className="role-info">
                    <span className="role-badge" style={{ backgroundColor: role.color }}>
                        {role.icon && <span>{role.icon}</span>}
                        {role.name}
                    </span>
                    <div className="role-details">
                        {role.displayName} • Prioridade: {role.priority}
                    </div>
                </div>

                <div className="permissions-section">
                    <h2>Permissões</h2>

                    {Object.entries(groups).map(([groupName, perms]) => (
                        <div key={groupName} className="permission-group">
                            <h3>{groupName}</h3>
                            <div className="permission-list">
                                {perms.map(perm => (
                                    <label
                                        key={perm.id}
                                        className={`permission-item ${this.state.selectedPermissionIds.has(perm.id) ? 'active' : ''}`}
                                        onClick={() => this.togglePermission(perm.id)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={this.state.selectedPermissionIds.has(perm.id)}
                                            onChange={() => { }}
                                        />
                                        <div>
                                            <div className="permission-name">{perm.name}</div>
                                            {perm.description && <div className="permission-desc">{perm.description}</div>}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    className="save-button"
                    disabled={this.state.saving}
                    onClick={() => this.handleSave()}
                >
                    {this.state.saving ? "Salvando..." : "Salvar Permissões"}
                </button>

                {this.state.successMessage && (
                    <div className="success-message">{this.state.successMessage}</div>
                )}
            </div>
        );
    }
}
