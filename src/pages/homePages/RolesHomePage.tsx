import { BasePage } from "../BasePage.tsx";
import type { BaseProps, PageState } from "../../types/PageTypes.ts";
import type { Role } from "../../types/RoleTypes.ts";
import * as React from "react";
import { AUTH_URL } from "../../Consts.ts";
import "../../stylesheet/RolesPageStyle.scss"

type RolesHomeState = PageState & {
    roles: Role[];
}

export class RolesHomePage extends BasePage<BaseProps, RolesHomeState> {
    state: RolesHomeState = {
        roles: [],
        loading: true,
        title: "Roles",
        err: undefined
    }

    async componentDidMount() {
        super.componentDidMount();
        try {
            const response = await this.get<Role[]>(`${AUTH_URL}/auth/roles`);
            if (response && response.data) {
                this.setState({
                    roles: response.data as unknown as Role[],
                    loading: false
                });
            }
        } catch (e) {
            console.error("Erro ao carregar roles:", e);
            this.setState({ loading: false });
        }
    }

    protected renderContent(): React.ReactNode {
        if (this.state.loading) {
            return <div className="roles-page container"><div className="loading-spinner">Carregando roles...</div></div>;
        }

        return (
            <div className="roles-page container">
                <div className="page-header">
                    <h1>Roles</h1>
                </div>
                <div className="roles-grid">
                    {this.state.roles.map((role) => (
                        <a key={role.id} className="role-card" href={`/roles/${role.id}`}>
                            <div className="role-card-header">
                                <span className="role-badge" style={{ backgroundColor: role.color }}>
                                    {role.icon && <span>{role.icon}</span>}
                                    {role.name}
                                </span>
                                <span className="role-priority">Prioridade: {role.priority}</span>
                            </div>
                            <div className="role-display-name">{role.displayName}</div>
                            <div className="role-permissions-count">
                                <span>{role.permissions.length}</span> permissões
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        );
    }
}
