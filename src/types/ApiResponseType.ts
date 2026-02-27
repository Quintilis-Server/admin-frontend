export interface ApiResponseType<T = null> {
    success: boolean
    message?: string
    data: T
    errorCode: ErrorCode;
    timestamp: Date;
}

export interface PageResponse<T> {
    items: T[],
    totalPages: number,
    currentPage: number
}

export const ErrorCode = {
    NOT_FOUND: 'NOT_FOUND',
    BAD_REQUEST: 'BAD_REQUEST',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_CAPTCHA: 'INVALID_CAPTCHA',
    INVALID_TOKEN: 'INVALID_TOKEN',
    ENCRYPTION_ERROR: 'ENCRYPTION_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    USER_ERROR: 'USER_ERROR',
} as const;
export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];