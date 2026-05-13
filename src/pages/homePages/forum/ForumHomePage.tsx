import {BasePage} from "../../BasePage.tsx";
import type {BaseProps, PageState} from "../../../types/PageTypes.ts";
import * as React from "react";
import "../../../stylesheet/HomePageStyle.scss"

export class ForumHomePage extends BasePage<BaseProps, PageState> {
    protected renderContent(): React.ReactNode {
        return (
            <main className="main-home container">
                <h1>Forum</h1>
                <div className="buttons">
                    <a href="/forum/categories">Categorias</a>
                    <a href="/forum/topic">Tópicos</a>
                    <a href="/forum/post">Posts</a>
                    <a href="/forum/events">Eventos</a>
                </div>
            </main>
        )
    }
}