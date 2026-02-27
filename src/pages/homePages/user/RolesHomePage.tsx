import { BasePage } from "../../BasePage.tsx";
import type { BaseProps, PageState } from "../../../types/PageTypes.ts";
import type {Permission, Role} from "../../../types/RoleTypes.ts";
import * as React from "react";
import "../../../stylesheet/RolesPageStyle.scss"
import {AUTH_URL} from "../../../Consts.ts";
import {ListComponent} from "../../../components/ListComponent.tsx";
import type {PageResponse} from "../../../types/ApiResponseType.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAddressCard, faKey} from "@fortawesome/free-solid-svg-icons";

type RolesHomeState = PageState & {
    roles: Role[];
    permissions: Permission[]
}

export class RolesHomePage extends BasePage<BaseProps, RolesHomeState> {
    state: RolesHomeState = {
        roles: [],
        permissions: [],
        loading: true,
        title: "Roles",
        err: undefined
    }

    async componentDidMount() {
        super.componentDidMount();
        try {
            const roles = await this.get<Role[]>(`${AUTH_URL}/auth/roles`);
            const permission = await this.get<Permission[]>(`${AUTH_URL}/auth/permissions`)
            if (roles && roles.data && permission && permission.data) {
                this.setState({
                    roles: roles.data.data,
                    permissions: permission.data.data,
                    loading: false
                });
            }
        } catch (e) {
            console.error("Erro ao carregar roles:", e);
            this.setState({ loading: false });
        }
    }


    private renderPermission(item: Permission){
        return (
            <div>
                <h2>{item.name}</h2>
                <span>{item.id}</span>
            </div>
        )
    }

    protected renderContent(): React.ReactNode {
        if (this.state.loading) {
            return <div className="roles-page container"><div className="loading-spinner">Carregando roles...</div></div>;
        }

        const {roles} = this.state

        return (
            <>
                <div className="roles-page container">
                    <div className="page-header">
                        <h2>Roles</h2>
                        <a className="new-button" href="/roles/new">
                            Novo role <FontAwesomeIcon icon={faAddressCard} />
                        </a>
                    </div>
                    <div className="roles-grid">
                        {roles.map((role) => (
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
                <div className="roles-page container">
                    <div className="page-header">
                        <h2>Permissões</h2>
                        <a className="new-button" href="/permission/new">
                            Nova Permissão <FontAwesomeIcon icon={faKey} />
                        </a>
                    </div>
                    <ListComponent<Permission, PageResponse<Permission>>
                        renderItem={(item) => this.renderPermission(item)}
                        getItemLink={(item) => `/permission/${item.id}`}
                        getSearchableText={(item) => `${item.id} ${item.name} ${item.description}`}
                        
                        sortOptions={[
                            {label: "Nome", field: "name"},
                            {label: "Descrição", field: "description"},
                            {label: "Id", field: "id"}
                        ]} apiUrl={`${AUTH_URL}/auth/permissions`}
                        withPage={true}
                    />
                </div>
            </>
        );
    }
}
