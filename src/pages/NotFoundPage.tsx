import { BasePage } from "./BasePage.tsx";
import * as React from "react";
import type { BaseProps, PageState } from "../types/PageTypes.ts";
import "../stylesheet/NotFoundStyle.scss"

export class NotFoundPage extends BasePage<BaseProps, PageState> {
    state: PageState = {
        loading: false,
        title: "Página não encontrada"
    }

    protected renderContent(): React.ReactNode {
        return (
            <main className="not-found container">
                <div className="not-found-content">
                    <span className="not-found-code">404</span>
                    <h1 className="not-found-title">Página não encontrada</h1>
                    <p className="not-found-message">
                        A página que você procura não existe ou foi movida.
                    </p>
                    <a href="/" className="not-found-btn">
                        Voltar para o Início
                    </a>
                </div>
            </main>
        );
    }
}
