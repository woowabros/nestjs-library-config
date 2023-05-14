import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigModule } from '../../src';
import { AppConfigService } from '../config/app-config.service';
import { LogLevel } from '../config/log-level.enum';
import { LoggerConfigService } from '../config/logger-config.service';
import { PinoConfigService } from '../config/pino-config.service';
import { RedisConfigService } from '../config/redis-config.service';

describe('Multiple Config as Array', () => {
    let app: INestApplication;
    let appConfigService: AppConfigService;
    let redisConfigService: RedisConfigService;
    let loggerConfigService: LoggerConfigService;
    let pinoConfigService: PinoConfigService;

    beforeEach(async () => {
        process.env.REDIS_URL = 'IP:PORT';

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forFeature([AppConfigService, RedisConfigService, LoggerConfigService, PinoConfigService])],
        }).compile();
        app = moduleFixture.createNestApplication();

        appConfigService = moduleFixture.get<AppConfigService>(AppConfigService);
        redisConfigService = moduleFixture.get<RedisConfigService>(RedisConfigService);
        loggerConfigService = moduleFixture.get<LoggerConfigService>(LoggerConfigService);
        pinoConfigService = moduleFixture.get<PinoConfigService>(PinoConfigService);

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

    describe('the cases with same variable name in different namespace', () => {
        it('should not modify `process.env` object when the environment variable is undefined', async () => {
            expect(loggerConfigService.logLevel).toBe(LogLevel.INFO);
            expect(pinoConfigService.logLevel).toBe(LogLevel.DEBUG);
            expect(process.env.LOG_LEVEL).toBeUndefined();
        });

        it('should not modify `process.env` object when the environment variable has value', async () => {
            process.env.LOG_LEVEL = LogLevel.TRACE;
            expect(loggerConfigService.logLevel).toBe(LogLevel.INFO);
            expect(pinoConfigService.logLevel).toBe(LogLevel.DEBUG);
            expect(process.env.LOG_LEVEL).toBe(LogLevel.TRACE);
        });
    });
});
