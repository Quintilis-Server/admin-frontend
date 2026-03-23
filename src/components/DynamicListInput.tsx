import React, {type ChangeEvent} from "react";

interface DynamicListInputProps {
    id: string;
    value: string[];
    onChange: (id: string, newValue: string[]) => void;
    disabled?: boolean;
}

interface DynamicListInputState {
    inputValue: string;
}

export class DynamicListInput extends React.Component<DynamicListInputProps, DynamicListInputState> {
    constructor(props: DynamicListInputProps) {
        super(props);
        this.state = {
            inputValue: ""
        };
    }

    private handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({ inputValue: e.target.value });
    };

    private handleAdd = () => {
        const { id, value, onChange } = this.props;
        const trimmed = this.state.inputValue.trim();

        // Evita adicionar strings vazias ou duplicadas
        if (trimmed && !value.includes(trimmed)) {
            onChange(id, [...value, trimmed]);
            this.setState({ inputValue: "" }); // Limpa o input após adicionar
        }
    };

    private handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita dar submit no form acidentalmente
            this.handleAdd();
        }
    };

    private handleRemove = (indexToRemove: number) => {
        const { id, value, onChange } = this.props;
        const newArray = value.filter((_, index) => index !== indexToRemove);
        onChange(id, newArray);
    };

    render() {
        const { value, disabled } = this.props;
        const { inputValue } = this.state;

        return (
            <div className="dynamic-list-container">
                <div className="dynamic-list-input-group" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={this.handleInputChange}
                        onKeyDown={this.handleKeyDown}
                        disabled={disabled}
                        placeholder="Digite e aperte Enter..."
                        style={{ flex: 1 }}
                    />
                    <button
                        type="button" // type="button" garante que não vai submeter o form principal
                        onClick={this.handleAdd}
                        disabled={disabled || !inputValue.trim()}
                        className="btn secondary"
                    >
                        Adicionar
                    </button>
                </div>

                <ul className="dynamic-list-items" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {value.map((item, index) => (
                        <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: '#f0f0f0', marginBottom: '4px', borderRadius: '4px' }}>
                            <span>{item}</span>
                            <button
                                type="button"
                                onClick={() => this.handleRemove(index)}
                                disabled={disabled}
                                style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer' }}
                            >
                                &times;
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}