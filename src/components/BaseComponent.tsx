import type {BaseState} from "../types/PageTypes.ts";
import * as React from "react";
import axios, {AxiosError, type AxiosResponse} from "axios";
import type {ApiResponseType} from "../types/ApiResponseType.ts";
import {BaseException} from "../exceptions/BaseException.ts";
import {InternalServerErrorException} from "../exceptions/InternalServerErrorException.ts";
import { EncryptException } from "../exceptions/EncryptException.ts";
import {JSEncrypt} from "jsencrypt";

export class BaseComponent<P = object, S extends BaseState = BaseState> extends React.PureComponent<P, S>{
    protected async get<T>(url: string, header: object | null = null): Promise<AxiosResponse<ApiResponseType<T>>> {
        const headers = {
            ...header,
        }
        return await axios.get<ApiResponseType<T>>(url, {headers})
    }

    protected async post<T, B>(url: string, body: B, header: object | null = null): Promise<AxiosResponse<ApiResponseType<T>>> {
        const headers = {
            "Content-Type": "application/json",
            ...header,
        }
        return await axios.post(url, body, {headers})
    }

    protected async executeAsync<T>(task: () => Promise<T>): Promise<T | null> {
        this.setState({loading: true})
        try{
            const result = await task();
            this.setState({err: undefined,loading: false})
            return result
        }catch(error: unknown){
            const exception = this.handleError(error)
            this.setState({err: exception, loading: false} as unknown as Pick<S, "err" | "loading">)
            return null
        }
    }

    protected async encryptData<T>(data: T): Promise<string> {
        const publicKey = await this.get<string>("/keys/public")
        if(!publicKey||!publicKey.data.success){
            throw new EncryptException("Falha ao obter chave publica")
        }

        const jse = new JSEncrypt();
        jse.setPublicKey(publicKey.data.data)
        const stringData = JSON.stringify(data)
        const encryptedData = jse.encrypt(stringData)

        if(encryptedData === false){
            throw new EncryptException("Falha ao encrypt")
        }
        return encryptedData
    }

    private handleError(error: unknown){
        if(axios.isAxiosError(error)){
            const apiError = error as AxiosError<ApiResponseType<string>>
            if(apiError.response && apiError.response.data){
                const errData = apiError.response.data
                throw new BaseException(errData.errorCode, errData.message,undefined)
            }else{
                throw new InternalServerErrorException("An unknown error occurred.")
            }
        }
    }
}