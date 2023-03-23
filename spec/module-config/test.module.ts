import { Module } from '@nestjs/common';

import { OtherService } from './other.service';
import { TestService } from './test.service';
import { ConfigModule } from '../../src/lib/config.module';
import { AppConfigService } from '../config/app-config.service';
import { RedisConfigService } from '../config/redis-config.service';

@Module({
    imports: [ConfigModule.forFeature(AppConfigService), ConfigModule.forFeature(RedisConfigService)],
    providers: [TestService, OtherService],
    exports: [TestService, OtherService],
})
export class TestModule {}
