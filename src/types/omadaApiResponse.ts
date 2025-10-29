export interface OmadaApiResponse<T> {
    errorCode: number;
    msg?: string;
    result?: T;
}
