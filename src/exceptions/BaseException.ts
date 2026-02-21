import type {ErrorCode} from "../types/ApiResponseType.ts";

export class BaseException extends Error {
    protected readonly errCode: ErrorCode

    constructor(error: Error, errCode: ErrorCode);
    constructor(errCode: ErrorCode, message?: string, name?:string, options?: ErrorOptions)

    constructor(
        errCode: ErrorCode | Error,
        messageOrErrCode: string | ErrorCode,
        name?: string,
        options?: ErrorOptions,
    ) {
        if(errCode instanceof Error) {
            super(errCode.message, options)
            this.name = errCode.name
            this.errCode = messageOrErrCode as ErrorCode
        }else{
            super(messageOrErrCode, options)
            if(name != null){
                this.name = name
            }
            this.errCode = errCode
        }
    }

    public getErrCode(): ErrorCode{
        return this.errCode
    }
}