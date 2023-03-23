import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigModule } from '../../src';
import { AppConfigService } from '../config/app-config.service';
import { RedisConfigService } from '../config/redis-config.service';

describe('Multiple Config as Array', () => {
    let app: INestApplication;
    let appConfigService: AppConfigService;
    let redisConfigService: RedisConfigService;

    beforeEach(async () => {
        process.env.REDIS_URL = 'IP:PORT';

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forFeature([AppConfigService, RedisConfigService])],
        }).compile();
        app = moduleFixture.createNestApplication();

        appConfigService = moduleFixture.get<AppConfigService>(AppConfigService);
        redisConfigService = moduleFixture.get<RedisConfigService>(RedisConfigService);

        await app.init();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('should provide configuration', async () => {
        expect(appConfigService.env).toBe('test');
        expect(redisConfigService.url).toBe('IP:PORT');
    });
});
