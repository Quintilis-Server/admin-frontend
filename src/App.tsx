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

// Wrapper para extrair 'id' via useParams e passar para páginas baseadas em classe
const CategoryEditPageWrapper = () => {
    const params = useParams();
    return <CategoryEditPage params={params as { id: string }} />;
};

const RoleEditPageWrapper = () => {
    const params = useParams();
    return <RoleEditPage params={params as { id: string }} />;
}

const UserRolesEditPageWrapper = () => {
    const params = useParams();
    return <UserRolesEditPage params={params as { id: string }} />;
}

function App() {

    return (
        <UserProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/authorized" element={<HomePage />} /> {/* Rota de callback que renderiza a Home (o UserProvider vai capturar o code) */}
                    <Route path="/forum" element={<ForumHomePage />} />
                    <Route path="/forum/category" element={<CategoryHomePage />} />
                    <Route path="/forum/category/new" element={<CategoryCreationPage />} />
                    <Route path="/forum/category/:id" element={<CategoryEditPageWrapper />} />
                    <Route path="/roles" element={<RolesHomePage />} />
                    <Route path="/roles/new" element={<RoleCreationPage/>}/>
                    <Route path="/roles/:id" element={<RoleEditPageWrapper />} />
                    <Route path="/users" element={<UsersHomePage />} />
                    <Route path="/users/:id/roles" element={<UserRolesEditPageWrapper />} />

                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Router>
        </UserProvider>
    )
}

export default App
