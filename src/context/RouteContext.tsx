import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { FrontendRoute } from "../types/FrontendRoute";
import { API_AUTH_ROUTES } from "../Consts";

interface RouteContextProps {
    routes: FrontendRoute[];
    loadingRoutes: boolean;
    refreshRoutes: () => Promise<void>;
}

export const RouteContext = createContext<RouteContextProps>({
    routes: [],
    loadingRoutes: true,
    refreshRoutes: async () => {},
});

export const RouteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [routes, setRoutes] = useState<FrontendRoute[]>([]);
    const [loadingRoutes, setLoadingRoutes] = useState(true);

    const fetchRoutes = async (forceRefresh = false) => {
        try {
            if (!forceRefresh) {
                const cached = localStorage.getItem("frontend_routes_cache");
                if (cached) {
                    setRoutes(JSON.parse(cached));
                    setLoadingRoutes(false);
                    return;
                }
            }

            setLoadingRoutes(true);
            // Faz a requisição direto
            const response = await fetch(`${API_AUTH_ROUTES}/frontend-routes/all`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.success && data.data && data.data.content) {
                    const fetchedRoutes = data.data.content;
                    setRoutes(fetchedRoutes);
                    localStorage.setItem("frontend_routes_cache", JSON.stringify(fetchedRoutes));
                }
            }
        } catch (error) {
            console.error("Failed to load frontend routes", error);
        } finally {
            setLoadingRoutes(false);
        }
    };

    useEffect(() => {
        fetchRoutes(false);
    }, []);

    const refreshRoutes = async () => {
        localStorage.removeItem("frontend_routes_cache");
        await fetchRoutes(true);
    };

    return (
        <RouteContext.Provider value={{ routes, loadingRoutes, refreshRoutes }}>
            {children}
        </RouteContext.Provider>
    );
};

// Expose a function to invalidate cache from anywhere (e.g., when a route is edited in BaseEditPage or CreationPage)
export const invalidateRoutesCache = () => {
    localStorage.removeItem("frontend_routes_cache");
};
