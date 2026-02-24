import { BaseComponent } from "./BaseComponent.tsx";
import "../stylesheet/NavBarStyle.scss"
import { UserContext } from "../context/UserContext.tsx";
import * as React from "react";
import { AuthService } from "../service/AuthService.ts";

export class Header extends BaseComponent {

    static contextType = UserContext;
    declare context: React.ContextType<typeof UserContext>;

    render() {

        return (
            <nav className="navbar">
                <div className="navbar-inner container">
                    <a className="nav-logo" href="/">
                        <div>
                            <span className="logo-letter">Q</span>
                            <span className="logo-text">uintilis</span>
                        </div>
                        <span className="logo-bottom">Admin</span>
                    </a>

                    <div className={`nav-links`}>
                        <a>Minecraft</a>
                        <a href="/forum">Forum</a>
                        <a href="/roles">Roles</a>
                        <a href="/users">Users</a>
                        <a>Eventos</a>
                    </div>

                    {/*<div className="nav-actions">*/}
                    {/*    {isLoggedIn ? (*/}
                    {/*        <div className="user-menu">*/}
                    {/*            <a href={`${AUTH_URL}/account`} className="user-profile-link">*/}
                    {/*                <span className="username">{user?.username}</span>*/}
                    {/*                {user?.avatarPath ? (*/}
                    {/*                    <img src={user.avatarPath} alt="Avatar" className="user-avatar" />*/}
                    {/*                ) : (*/}
                    {/*                    <FontAwesomeIcon icon={faUser} className="user-icon" />*/}
                    {/*                )}*/}
                    {/*            </a>*/}
                    {/*            <FontAwesomeIcon onClick={logout} icon={faRightFromBracket} />*/}
                    {/*        </div>*/}
                    {/*    ) : (*/}
                    {/*        <a href={AuthService.getLoginUrl()} className="login-link">*/}
                    {/*            <FontAwesomeIcon icon={faArrowRightToBracket} />*/}
                    {/*            <span style={{marginLeft: '5px'}}>Entrar</span>*/}
                    {/*        </a>*/}
                    {/*    )}*/}
                    {/*</div>*/}
                </div>
                {/* ${this.state.menuOpen ? 'open' : ''}*/}
            </nav>
        )
    }
}