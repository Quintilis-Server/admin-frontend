import {UserProvider} from "./context/UserContext.tsx";
import {HomePage} from "./pages/HomePage.tsx";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

function App() {

    return (
        <UserProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/authorized" element={<HomePage/>}/> {/* Rota de callback que renderiza a Home (o UserProvider vai capturar o code) */}
                </Routes>
            </Router>
        </UserProvider>
    )
}

export default App
