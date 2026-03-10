import * as React from "react";
import "../stylesheet/MultiSelectStyle.scss"

interface Option {
    label: string;
    value: string | number;
}

interface MultiSelectProps {
    id: string;
    options?: Option[];
    value: string[];
    onChange: (value: string[]) => void;
}

export class MultiSelect extends React.PureComponent<MultiSelectProps> {

    private toggleOption = (value: string) => {
        if(this.props.value.includes(value)) {
            this.props.onChange(this.props.value.filter(valueP => valueP !== value));
        } else {
            this.props.onChange([...this.props.value, value]);
        }
    }

    render(){
        return (
            <div id={this.props.id} className="multiselect">
                {this.props.options?.map(option => {
                    const strValue = String(option.value);
                    const isSelected = this.props.value.includes(strValue);

                    return (
                        <label key={strValue} className="multiselect__option">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => this.toggleOption(strValue)}
                            />
                            {option.label}
                        </label>
                    );
                })}
            </div>
        );
    }
}