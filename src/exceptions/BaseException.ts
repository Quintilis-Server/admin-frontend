import type {ApiResponseType, ErrorCode} from "../types/ApiResponseType.ts";
import type {AxiosError} from "axios";

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

    public static fromResponse<T>(apiResponse: ApiResponseType<T>): BaseException{
        return new BaseException(
            apiResponse.errorCode,
            apiResponse.message,
        )
    }

    public static fromAxiosError<T>(axiosError: AxiosError<ApiResponseType<T>>): BaseException {
        if(axiosError.response){
            return new BaseException(
                axiosError.response?.data.errorCode,
                axiosError.response?.data.message
            )
        }
        return new BaseException(
            axiosError.code as ErrorCode,
            axiosError.message
        )
    }

    public getErrCode(): ErrorCode{
        return this.errCode
    }
}