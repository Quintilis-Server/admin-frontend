import type {BaseException} from "../exceptions/BaseException.ts";

export type BaseState = {
    err?: BaseException;
    loading: boolean;
}

export type PageState = BaseState & {
    title: string | null;
}

export type BaseProps = {
    params?: object;
}