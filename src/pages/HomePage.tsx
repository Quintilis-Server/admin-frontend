import {BasePage} from "./BasePage.tsx";
import * as React from "react";
import type {BaseProps, PageState} from "../types/PageTypes.ts";
import "../stylesheet/GraphStyle.scss"

export class HomePage extends BasePage<BaseProps, PageState> {
    state: PageState = {
        loading: false, title: "Admin Home"

    }
    protected renderContent(): React.ReactNode {
        return (
            <main>
                <section className="graphs container">
                    <h2>Graficos</h2>
                    <div className="graph">

                    </div>
                </section>
            </main>
        )
    }
}