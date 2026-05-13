import {BaseEditPage} from "../../BaseEditPage.tsx";
import type {MineEvent} from "../../../types/MinecraftTypes.ts";
import type {FormSchema} from "../../../types/FormOption.ts";
import {API_FORUM_ROUTES} from "../../../Consts.ts";

const MINE_EVENT_FORM_SCHEMA: FormSchema<any> ={
    id: {label: "Id", type: "text",readonly: true},
    name: {
        label: "Nome",
        type: "text",
        readonly: false
    },
    description: {label: "Descrição", type: "textarea", readonly: false},
    startsAt: {label: "Começo", type: "date", readonly: false},
    endsAt: {label: "Fim", type: "date", readonly: false},
    visible: {label: "Visível", type: "boolean", readonly: false},
    createdAt: {label: "Hora da Criação", type: "date", readonly: true},
    img: { label: "Imagem do Evento", type: "image", readonly: false }
}
export class MineEventEditPage extends BaseEditPage<MineEvent, typeof MINE_EVENT_FORM_SCHEMA> {
    protected getResourceName(): string {
        return `${API_FORUM_ROUTES}/events`
    }
    protected getReturnURL(): string {
        return "forum/events"
    }
    protected getFormSchema(): FormSchema<MineEvent> {
        return MINE_EVENT_FORM_SCHEMA
    }

}