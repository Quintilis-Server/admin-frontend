import { BasePage } from "../BasePage.tsx";
import type { BaseProps, PageState } from "../../types/PageTypes.ts";
import type { UserWithRoles } from "../../types/RoleTypes.ts";
import * as React from "react";
import { AUTH_URL } from "../../Consts.ts";
import "../../stylesheet/RolesPageStyle.scss"

type UsersHomeState = PageState & {
    users: UserWithRoles[];
}

export class UsersHomePage extends BasePage<BaseProps, UsersHomeState> {
    state: UsersHomeState = {
        users: [],
        loading: true,
        title: "Users",
        err: undefined
    }

    async componentDidMount() {
        super.componentDidMount();
        try {
            const response = await this.get<UserWithRoles[]>(`${AUTH_URL}/auth/users`);
            if (response && response.data) {
                this.setState({
                    users: response.data as unknown as UserWithRoles[],
                    loading: false
                });
            }
        } catch (e) {
            console.error("Erro ao carregar users:", e);
            this.setState({ loading: false });
        }
    }

    protected renderContent(): React.ReactNode {
        if (this.state.loading) {
            return <div className="users-page container"><div className="loading-spinner">Carregando users...</div></div>;
        }

        return (
            <div className="users-page container">
                <div className="page-header">
                    <h1>Usuários</h1>
                </div>
                <div className="users-list">
                    {this.state.users.map((user) => (
                        <a key={user.id} className="user-card" href={`/users/${user.id}/roles`}>
                            <div className="user-avatar">
                                {user.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info">
                                <div className="user-name">{user.username}</div>
                                <div className="user-email">{user.email}</div>
                            </div>
                            <div className="user-roles">
                                {user.roles.map((role) => (
                                    <span key={role.id} className="role-badge" style={{ backgroundColor: role.color }}>
                                        {role.name}
                                    </span>
                                ))}
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        );
    }
}
