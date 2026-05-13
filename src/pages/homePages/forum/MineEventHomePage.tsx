import {BaseHomePage, type BaseHomeState} from "../../BaseHomePage.tsx";
import type {MineEvent} from "../../../types/MinecraftTypes.ts";
import type {BaseProps} from "../../../types/PageTypes.ts";
import {API_FORUM_ROUTES} from "../../../Consts.ts";

export class MineEventHomePage extends BaseHomePage<MineEvent, BaseProps, BaseHomeState<MineEvent>>{
    protected getNewPath(): string {
        return "/forum/events/new"
    }
    protected getApiUrl(): string {
        return `${API_FORUM_ROUTES}/events/all/with-inactive`;
    }
    protected getPageTitle(): string {
        return "Eventos"
    }
    protected renderItem(item: MineEvent): React.ReactNode {
        return (
            <>
                <div>
                    <p>{item.name}</p>
                </div>
                <div>
                    <span>{item.description}</span>
                </div>
            </>
        )
    }
    protected getSearchableText(item: MineEvent): string {
        return `${item.name}`
    }
    protected getItemLink(item: MineEvent): string {
        console.log(item)
        return `/forum/events/${item.id}`
    }

}