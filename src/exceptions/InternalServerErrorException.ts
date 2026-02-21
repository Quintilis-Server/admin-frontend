import {BaseException} from "./BaseException.ts";
import {ErrorCode} from "../types/ApiResponseType.ts";

export class InternalServerErrorException extends BaseException {
    constructor(message?: string, options?: ErrorOptions) {
        super(ErrorCode.INTERNAL_SERVER_ERROR, message, "InternalServerErrorException", options);
        // this.name = "InternalServerErrorException";
    }
}