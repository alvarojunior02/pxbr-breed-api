import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHealth() {
        return {
            status: 'ok',
            app: 'pxbr-breed-api',
            timestamp: new Date().toISOString(),
        };
    }
}
