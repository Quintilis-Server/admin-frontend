import type {PageState} from "./PageTypes.ts";

export interface FormOption {
    label: string;
    value: string;
}

export type FieldType = 'text' | 'textarea' | 'date' | 'select' | 'multiselect' | 'image' | "number" | "color" | "icon" | "dynamic-list";

export interface FormField {
    label: string;
    type: FieldType;
    readonly: boolean;
    // path?: GetArrayPath;
    options?: FormOption[];
}

/**
 * Cria o FormField para cada key `K` do tipo generico `T`
 * @template T Objeto a ser usado
 */
export type FormSchema<T> = {
    [K in keyof T]: FormField;
};

export type FormState<T> = PageState & {
    formData: T;
    // arrayOptions: Record<string, FormOption[]>
};