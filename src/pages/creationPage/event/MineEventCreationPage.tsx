import {BaseCreationPage} from "../../BaseCreationPage.tsx";
import type {FormSchema, FormState} from "../../../types/FormOption.ts";
import {API_FORUM_ROUTES} from "../../../Consts.ts";
import type {PageState} from "../../../types/PageTypes.ts";

type MineEventData = {
    name: string
    description: string
    startsAt: Date
    endsAt: Date
    visible: boolean
}

const MINE_EVENT_FORM_SCHEMA: FormSchema<MineEventData> ={
    name: {
        label: "Nome",
        type: "text",
        readonly: false
    },
    description: {label: "Descrição", type: "textarea", readonly: false},
    startsAt: {label: "Começo", type: "date", readonly: false},
    endsAt: {label: "Fim", type: "date", readonly: false},
    visible: {label: "Visível", type: "boolean", readonly: false}
}

export class MineEventCreationPage extends BaseCreationPage<MineEventData, typeof MINE_EVENT_FORM_SCHEMA> {
    protected getResourceName(): string {
        return `${API_FORUM_ROUTES}/events`
    }
    protected getReturnURL(): string {
        return "/forum/events"
    }
    protected getFormSchema(): FormSchema<MineEventData> {
        return MINE_EVENT_FORM_SCHEMA
    }

    state: FormState<MineEventData> & PageState = {
        formData: {
            name: "",
            description: "",
            startsAt: new Date(),
            endsAt: new Date(),
            visible: false
        }, loading: false, title: "Novo Evento"

    }

    protected async handleSubmit(): Promise<void> {

        return super.handleSubmit();
    }

}