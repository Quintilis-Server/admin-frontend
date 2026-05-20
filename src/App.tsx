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
import {MineEventHomePage} from "./pages/homePages/forum/MineEventHomePage.tsx";
import {MineEventCreationPage} from "./pages/creationPage/event/MineEventCreationPage.tsx";
import {MineEventEditPage} from "./pages/editPage/event/MineEventEditPage.tsx";

import {FrontendRoutesHomePage} from "./pages/homePages/auth/FrontendRoutesHomePage.tsx";
import {FrontendRoutesCreationPage} from "./pages/creationPage/auth/FrontendRoutesCreationPage.tsx";
import {FrontendRoutesEditPage} from "./pages/editPage/auth/FrontendRoutesEditPage.tsx";

import { RouteProvider } from "./context/RouteContext.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";

// Wrapper global para rotas
const Guarded = ({ children }: { children: React.ReactNode }) => (
    <ProtectedRoute>{children}</ProtectedRoute>
);

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

const FrontendRoutesEditPageWrapper = () =>{
    const params = useParams()
    return <FrontendRoutesEditPage params={params as { id: string }}/>
}

const UserRolesEditPageWrapper = () => {
    const params = useParams();
    return <UserRolesEditPage params={params as { id: string }} />;
}

const OIDCClientEditPageWrapper = () => {
    const params = useParams();
    return <OIDCClientEditPage params={params as { id: string }} />;
}

const MineEventEditPageWrapper = () =>{
    const params = useParams()
    return <MineEventEditPage params={params as {id: string}} />
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
            <RouteProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Guarded><HomePage /></Guarded>} />
                        <Route path="/authorized" element={<HomePage />} /> {/* Rota de callback */}

                        <Route path="/forum" element={<Guarded><ForumHomePage /></Guarded>} />
                        <Route path="/forum/categories" element={<Guarded><CategoryHomePage /></Guarded>} />
                        <Route path="/forum/categories/new" element={<Guarded><CategoryCreationPage /></Guarded>} />
                        <Route path="/forum/categories/:id" element={<Guarded><CategoryEditPageWrapper /></Guarded>} />

                        <Route path="/forum/events" element={<Guarded><MineEventHomePage /></Guarded>} />
                        <Route path="/forum/events/new" element={<Guarded><MineEventCreationPage /></Guarded>} />
                        <Route path="/forum/events/:id" element={<Guarded><MineEventEditPageWrapper /></Guarded>} />

                        <Route path="/auth/permission/new" element={<Guarded><PermissionCreationPage /></Guarded>} />

                        <Route path="auth" element={<Guarded><AuthHomePage/></Guarded>} />

                        <Route path="/auth/roles" element={<Guarded><RolesHomePage /></Guarded>} />
                        <Route path="/auth/roles/new" element={<Guarded><RoleCreationPage/></Guarded>}/>
                        <Route path="/auth/roles/:id" element={<Guarded><RoleEditPageWrapper /></Guarded>} />

                        <Route path="/auth/users" element={<Guarded><UsersHomePage /></Guarded>} />
                        <Route path="/auth/users/:id/roles" element={<Guarded><UserRolesEditPageWrapper /></Guarded>} />

                        <Route path="/auth/routes" element={<Guarded><RoutesHomePage /></Guarded>}/>
                        <Route path="/auth/routes/:id" element={<Guarded><RoutesEditPageWrapper /></Guarded>} />

                        <Route path="/auth/frontend-routes" element={<Guarded><FrontendRoutesHomePage /></Guarded>}/>
                        <Route path="/auth/frontend-routes/new" element={<Guarded><FrontendRoutesCreationPage /></Guarded>} />
                        <Route path="/auth/frontend-routes/:id" element={<Guarded><FrontendRoutesEditPageWrapper /></Guarded>} />

                        <Route path="/auth/oidc" element={<Guarded><OIDCClientHomePage/></Guarded>}/>
                        <Route path="/auth/oidc/new" element={<Guarded><OIDCClientCreationPage/></Guarded>} />
                        <Route path="/auth/oidc/:id" element={<Guarded><OIDCClientEditPageWrapper/></Guarded>}/>

                        <Route path="*" element={<Guarded><NotFoundPage /></Guarded>} />
                    </Routes>
                </Router>
            </RouteProvider>
        </UserProvider>
    )
}

export default App
