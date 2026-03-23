import {BasePage} from "../../BasePage.tsx";
import React from "react";

export class AuthHomePage extends BasePage<any, any>{
    protected renderContent(): React.ReactNode {
        return (
            <main className="main-home container">
                <h1>Segurança</h1>
                <div className="buttons">
                    <a href={"/auth/routes"}>Endpoints</a>
                    <a href={"/auth/users"}>Usuarios</a>
                    <a href={"/auth/roles"}>Roles/Permissões</a>
                    <a href={"/auth/oidc"}>OIDC Clients</a>
                </div>
            </main>
        )
    }

}