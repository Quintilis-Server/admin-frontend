import type {PageState} from "./PageTypes.ts";

export interface FormOption {
    label: string;
    value: string;
}

export type FieldType = 'text' | 'textarea' | 'date' | 'select' | 'multiselect' | 'image' | "number" | "color" | "icon";

export interface FormField {
    label: string;
    type: FieldType;
    readonly: boolean;
    // path?: GetArrayPath;
    options?: FormOption[];
}

export type FormSchema<T> = {
    [K in keyof T]: FormField;
};

export type FormState<T> = PageState & {
    formData: T;
    // arrayOptions: Record<string, FormOption[]>
};