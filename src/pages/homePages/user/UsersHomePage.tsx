import { BasePage } from "../../BasePage.tsx";
import type { BaseProps, PageState } from "../../../types/PageTypes.ts";
import type { UserWithRoles } from "../../../types/RoleTypes.ts";
import * as React from "react";
import { AUTH_URL } from "../../../Consts.ts";
import "../../../stylesheet/RolesPageStyle.scss"
import {ListComponent} from "../../../components/ListComponent.tsx";

type UsersHomeState = PageState & {
    users: UserWithRoles[];
}

export class UsersHomePage extends BasePage<BaseProps, UsersHomeState> {
    state: UsersHomeState = {
        loading: false,
        users: [],
        title: "Users",
        err: undefined
    }

    // async componentDidMount() {
    //     super.componentDidMount();
    //     try {
    //         const response = await this.get<UserWithRoles[]>(`${AUTH_URL}/auth/users`);
    //         if (response && response.data) {
    //             this.setState({
    //                 users: response.data as unknown as UserWithRoles[],
    //                 loading: false
    //             });
    //         }
    //     } catch (e) {
    //         console.error("Erro ao carregar users:", e);
    //         this.setState({ loading: false });
    //     }
    // }

    private renderUserComponent(item: UserWithRoles) {
        return <>
            <div className="user-avatar">
                {item.username?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
                <div className="user-name">
                    {item.username}
                </div>
                <div className="user-email">
                    {item.email}
                </div>
            </div>
            <div className="user-roles">
                {item.roles.map((role) => (
                    <span
                        key={role.id}
                        className="role-badge"
                        style={{
                            backgroundColor: role.color || "#007bff",
                        }}
                    >
                                {role.name.replace('ROLE_', '')}
                            </span>
                ))}
            </div>
        </>
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
                <ListComponent <UserWithRoles, UserWithRoles[]>
                    apiUrl={`${AUTH_URL}/auth/users`}
                    renderItem={(item) => this.renderUserComponent(item)}
                    getItemLink={(item) => `/user/${item.id}`}
                    getSearchableText={(item) => `${item.id} ${item.username} ${item.email}`}
                    sortOptions={[
                        {label: "Username", field: "username"},
                        {label: "Email", field: "email"},
                        {label: "Id", field: "id"}
                    ]}
                    className="users-list"
                    itemClassName="user-card"
                    // itemClassName={"user-card-info"}
                    withPage={false}
                />
                {/*<UserListComponent />*/}
            </div>
        );
    }
}
