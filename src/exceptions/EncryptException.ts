import {BaseException} from "./BaseException.ts";
import {ErrorCode} from "../types/ApiResponseType.ts";

export class EncryptException extends BaseException {
    constructor(message?: string, options?: ErrorOptions) {
        super(ErrorCode.ENCRYPTION_ERROR,message, "EncryptionException", options);
    }
}