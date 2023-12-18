import { Injectable } from '@nestjs/common';

import { AppConfigService } from '../config/app-config.service';
import { RedisConfigService } from '../config/redis-config.service';

@Injectable()
export class TestService {
    constructor(
        public appConfigService: AppConfigService,
        public redisConfigService: RedisConfigService,
    ) {}
}
