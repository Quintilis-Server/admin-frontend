import { UserProvider } from "./context/UserContext.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ForumHomePage } from "./pages/homePages/forum/ForumHomePage.tsx";
import { CategoryHomePage } from "./pages/homePages/forum/CategoryHomePage.tsx";
import { CategoryCreationPage } from "./pages/creationPage/forum/CategoryCreationPage.tsx";
import { RolesHomePage } from "./pages/homePages/user/RolesHomePage.tsx";
import { RoleEditPage } from "./pages/editPage/user/RoleEditPage.tsx";
import { UsersHomePage } from "./pages/homePages/user/UsersHomePage.tsx";
import { UserRolesEditPage } from "./pages/editPage/user/UserRolesEditPage.tsx";
import { CategoryEditPage } from "./pages/editPage/forum/CategoryEditPage.tsx";
import { useParams } from "react-router-dom";
import {NotFoundPage} from "./pages/NotFoundPage.tsx";
import {RoleCreationPage} from "./pages/creationPage/user/RoleCreationPage.tsx";
import { RoutesHomePage } from "./pages/homePages/auth/RoutesHomePage.tsx";
import {RoutesEditPage} from "./pages/editPage/auth/RoutesEditPage.tsx";
import {PermissionCreationPage} from "./pages/creationPage/user/PermissionCreationPage.tsx";
import {useEffect} from "react";
import {AuthService} from "./service/AuthService.ts";
import {AuthHomePage} from "./pages/homePages/auth/AuthHomePage.tsx";
import {OIDCClientHomePage} from "./pages/homePages/auth/OIDCClientHomePage.tsx";
import {OIDCClientCreationPage} from "./pages/creationPage/auth/OIDCClientCreationPage.tsx";
import {OIDCClientEditPage} from "./pages/editPage/auth/OIDCClientEditPage.tsx";

// Wrapper para extrair 'id' via useParams e passar para páginas baseadas em classe
const CategoryEditPageWrapper = () => {
    const params = useParams();
    return <CategoryEditPage params={params as { id: string }} />;
};

const RoleEditPageWrapper = () => {
    const params = useParams();
    return <RoleEditPage params={params as { id: string }} />;
}

const RoutesEditPageWrapper = () =>{
    const params = useParams()
    return <RoutesEditPage params={params as { id: string }}/>
}

const UserRolesEditPageWrapper = () => {
    const params = useParams();
    return <UserRolesEditPage params={params as { id: string }} />;
}

const OIDCClientEditPageWrapper = () => {
    const params = useParams();
    return <OIDCClientEditPage params={params as { id: string }} />;
}

function App() {

    useEffect(()=>{
        AuthService.initWorker()
        return () =>{
            return AuthService.stopWorker()
        }
    },[])

    return (
        <UserProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/authorized" element={<HomePage />} /> {/* Rota de callback que renderiza a Home (o UserProvider vai capturar o code) */}

                    <Route path="/forum" element={<ForumHomePage />} />
                    <Route path="/forum/categories" element={<CategoryHomePage />} />
                    <Route path="/forum/categories/new" element={<CategoryCreationPage />} />
                    <Route path="/forum/categories/:id" element={<CategoryEditPageWrapper />} />

                    <Route path="/permission/new" element={<PermissionCreationPage />} />

                    <Route path="auth" element={<AuthHomePage/>} />

                    <Route path="/auth/roles" element={<RolesHomePage />} />
                    <Route path="/auth/roles/new" element={<RoleCreationPage/>}/>
                    <Route path="/auth/roles/:id" element={<RoleEditPageWrapper />} />

                    <Route path="/auth/users" element={<UsersHomePage />} />
                    <Route path="/auth/users/:id/roles" element={<UserRolesEditPageWrapper />} />

                    <Route path="/auth/routes" element={<RoutesHomePage />}/>
                    <Route path="/auth/routes/:id" element={<RoutesEditPageWrapper />} />

                    <Route path="/auth/oidc" element={<OIDCClientHomePage/>}/>
                    <Route path="/auth/oidc/new" element={<OIDCClientCreationPage/>} />
                    <Route path="/auth/oidc/:id" element={<OIDCClientEditPageWrapper/>}/>

                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Router>
        </UserProvider>
    )
}

export default App
