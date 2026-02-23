import {UserProvider} from "./context/UserContext.tsx";
import {HomePage} from "./pages/HomePage.tsx";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {ForumHomePage} from "./pages/homePages/ForumHomePage.tsx";
import {CategoryHomePage} from "./pages/homePages/forum/CategoryHomePage.tsx";
import {CategoryCreationPage} from "./pages/creationPage/forum/CategoryCreationPage.tsx";

function App() {

    return (
        <UserProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/authorized" element={<HomePage/>}/> {/* Rota de callback que renderiza a Home (o UserProvider vai capturar o code) */}
                    <Route path="/forum" element={<ForumHomePage/>}/>
                    <Route path="/forum/category" element={<CategoryHomePage/>}/>
                    <Route path="/forum/category/new" element={<CategoryCreationPage/>}/>
                </Routes>
            </Router>
        </UserProvider>
    )
}

export default App
