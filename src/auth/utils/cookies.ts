import type { Request } from 'express';

export function getRefreshTokenFromRequest(request: Request): string | undefined {
    const cookies: unknown = request.cookies;

    if (!cookies || typeof cookies !== 'object') {
        return undefined;
    }

    const refreshToken = (cookies as Record<string, unknown>).refreshToken;

    return typeof refreshToken === 'string' ? refreshToken : undefined;
}
