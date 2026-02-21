import {BasePage} from "./BasePage.tsx";
import * as React from "react";
import type {BaseProps, PageState} from "../types/PageTypes.ts";

export class HomePage extends BasePage<BaseProps, PageState> {
    state: PageState = {
        loading: false, title: "Admin Home"

    }
    protected renderContent(): React.ReactNode {
        return (
            <main></main>
        )
    }
}