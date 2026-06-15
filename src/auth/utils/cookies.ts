import type { Request } from "express";

export function getRefreshTokenFromRequest(request: Request): string | undefined {
    return request.cookies?.refreshToken;
}
