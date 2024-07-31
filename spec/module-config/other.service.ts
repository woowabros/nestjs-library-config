import { Injectable } from '@nestjs/common';

import { AppConfigService, NodeEnvironment } from '../config/app-config.service';
import { RedisConfigService } from '../config/redis-config.service';

@Injectable()
export class OtherService {
    constructor(
        public appConfigService: AppConfigService,
        public redisConfigService: RedisConfigService,
    ) {}

    setLocalEnvironment(): void {
        this.appConfigService.changeValue('env', NodeEnvironment.LOCAL);
    }
}
