import { BaseComponent } from "./BaseComponent.tsx";
import { Link } from "react-router-dom";

type baseNameType = {
    id: string | number;
    name?: string;
    title?: string;
}

type props<T extends baseNameType> = {
    type: T
}

class HomeListComponent<T extends baseNameType> extends BaseComponent<props<T>> {
    render() {
        const { type } = this.props;
        const currentPath = window.location.pathname;
        return (
            <Link to={`${currentPath}/${type.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={"item-list"}>
                    <p>Id: {type.id}</p>
                    <p>Nome: {type.name || type.title}</p>
                </div>
            </Link>
        );
    }
}
export default HomeListComponent