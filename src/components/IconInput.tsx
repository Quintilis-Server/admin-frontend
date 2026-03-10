import { type ChangeEvent, PureComponent, createRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// 1. Importando as 3 coleções!
import * as solidIcons from "@fortawesome/free-solid-svg-icons";
import * as regularIcons from "@fortawesome/free-regular-svg-icons";
import * as brandIcons from "@fortawesome/free-brands-svg-icons";

import { type IconDefinition, faIcons, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import "../stylesheet/IconInputStyle.scss";

interface IconInputProps {
    id: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

interface IconInputState {
    isOpen: boolean;
    search: string;
}

// 2. Dicionário Semântico Customizado
// Você pode expandir isso infinitamente com termos do seu negócio (ex: 'financeiro', 'rh')
const SEARCH_ALIASES: Record<string, string[]> = {
    'admin': ['user-shield', 'user-tie', 'user-gear', 'lock', 'key', 'crown'],
    'config': ['gear', 'sliders', 'wrench', 'screwdriver'],
    'delete': ['trash', 'xmark', 'eraser', 'ban'],
    'edit': ['pen', 'pencil', 'file-pen'],
    'save': ['floppy-disk', 'check', 'cloud-arrow-up'],
    'money': ['dollar-sign', 'coins', 'money-bill', 'wallet', 'credit-card', 'brazilian-real-sign'],
    'time': ['clock', 'calendar', 'hourglass'],
    'social': ['facebook', 'instagram', 'twitter', 'linkedin', 'whatsapp', 'tiktok'],
    'sucesso': ['check', 'thumbs-up', 'award']
};

const isIconDefinition = (item: any): item is IconDefinition => {
    return typeof item === 'object' && item !== null && 'prefix' in item && 'iconName' in item;
};

// 3. Junta as 3 coleções num array gigante
const ALL_ICONS_OBJECTS = [
    ...Object.values(solidIcons).filter(isIconDefinition),
    ...Object.values(regularIcons).filter(isIconDefinition),
    ...Object.values(brandIcons).filter(isIconDefinition),
];

// 4. Remove duplicatas baseadas no Prefixo + Nome (ex: fas-user e far-user agora coexistem pacificamente)
const UNIQUE_ICONS = Array.from(
    new Map(ALL_ICONS_OBJECTS.map(icon => [`${icon.prefix}-${icon.iconName}`, icon])).values()
);

export class IconInput extends PureComponent<IconInputProps, IconInputState> {
    state: IconInputState = {
        isOpen: false,
        search: ""
    };

    private wrapperRef = createRef<HTMLDivElement>();

    componentDidMount() {
        document.addEventListener("mousedown", this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.handleClickOutside);
    }

    private handleClickOutside = (event: MouseEvent) => {
        if (this.wrapperRef.current && !this.wrapperRef.current.contains(event.target as Node)) {
            this.setState({ isOpen: false });
        }
    };

    private toggleOpen = () => {
        this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
    };

    private handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({ search: e.target.value });
    };

    private handleSelectIcon = (icon: IconDefinition) => {
        const { id, onChange } = this.props;
        const iconStringValue = `${icon.prefix} fa-${icon.iconName}`;

        const event = {
            target: { id, value: iconStringValue }
        } as ChangeEvent<HTMLInputElement>;

        onChange(event);
        this.setState({ isOpen: false, search: '' });
    };

    // 5. O Filtro agora é "Inteligente"
    private getDisplayIcons = (): IconDefinition[] => {
        const { search } = this.state;
        const searchLower = search.trim().toLowerCase();

        if (!searchLower) return UNIQUE_ICONS.slice(0, 100);

        // Acha quais nomes de ícones estão atrelados à palavra digitada no nosso dicionário
        const aliasMatches = Object.entries(SEARCH_ALIASES).flatMap(([key, mappedIconNames]) => {
            if (key.includes(searchLower)) return mappedIconNames;
            return [];
        });

        const filtered = UNIQUE_ICONS.filter(icon => {
            const nameMatch = icon.iconName.toLowerCase().includes(searchLower);
            // Permite buscar também por coleções digitando "fab" (Brands) ou "far" (Regular)
            const prefixMatch = icon.prefix.toLowerCase().includes(searchLower);
            const aliasMatch = aliasMatches.includes(icon.iconName);

            return nameMatch || prefixMatch || aliasMatch;
        });

        return filtered.slice(0, 100);
    };

    render() {
        const { value } = this.props;
        const { isOpen, search } = this.state;
        const displayIcons = this.getDisplayIcons();

        const selectedIconObject = UNIQUE_ICONS.find(
            icon => `${icon.prefix} fa-${icon.iconName}` === value
        );

        return (
            <div className="icon-picker-wrapper" ref={this.wrapperRef}>
                <div className="icon-picker-trigger" onClick={this.toggleOpen}>
                    <div className="icon-preview">
                        <FontAwesomeIcon icon={selectedIconObject || faIcons} />
                    </div>

                    <div className="icon-text-display">
                        {value || "Selecione um ícone..."}
                    </div>

                    <div className="icon-dropdown-arrow">
                        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
                    </div>
                </div>

                {isOpen && (
                    <div className="icon-picker-dropdown">
                        <div className="icon-picker-search-box">
                            <input
                                type="text"
                                placeholder="Buscar ícone (ex: admin, money)..."
                                value={search}
                                onChange={this.handleSearchChange}
                                autoFocus
                            />
                            <small style={{display: 'block', marginTop: '5px', color: 'var(--text-secondary)', fontSize: '0.8rem'}}>
                                Mostrando {displayIcons.length} resultados.
                            </small>
                        </div>

                        <div className="icon-picker-grid">
                            {displayIcons.map(icon => {
                                const iconString = `${icon.prefix} fa-${icon.iconName}`;

                                return (
                                    <button
                                        // Usamos prefix + nome como Key pois agora temos o 'user' Regular e Solid
                                        key={`${icon.prefix}-${icon.iconName}`}
                                        type="button"
                                        className={`icon-btn ${value === iconString ? 'active' : ''}`}
                                        onClick={() => this.handleSelectIcon(icon)}
                                        // No title, mostramos se é fas, far ou fab para o usuário saber a diferença
                                        title={`${icon.prefix} fa-${icon.iconName}`}
                                    >
                                        <FontAwesomeIcon icon={icon} />
                                    </button>
                                );
                            })}

                            {displayIcons.length === 0 && (
                                <div className="no-icons">Nenhum ícone encontrado</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}