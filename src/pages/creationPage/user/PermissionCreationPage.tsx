import {BaseCreationPage} from "../../BaseCreationPage.tsx";
import type {FormSchema, FormState} from "../../../types/FormOption.ts";
import {AUTH_URL} from "../../../Consts.ts";

type PermissionData = {
    name: string
}

const PERMISSION_FORM_SCHEMA: FormSchema<PermissionData> = {
    name: { label: "Nome", type: "text", readonly: false }
}

export class PermissionCreationPage extends BaseCreationPage<PermissionData, typeof PERMISSION_FORM_SCHEMA>{
    state: FormState<PermissionData> = {
        formData: {
            name: ""
        },
        err: undefined,
        title: "Nova permissão",
        loading: false
    }

    protected getReturnURL(): string {
        return "/roles"
    }

    protected getResourceName(): string {
        return `${AUTH_URL}/auth/permissions`
    }

    protected getFormSchema(): typeof PERMISSION_FORM_SCHEMA {
        return PERMISSION_FORM_SCHEMA
    }
}