export interface TokenResult {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    refreshToken?: string;
}
