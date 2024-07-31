import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ValidationError } from 'class-validator';

import { OtherService } from './other.service';
import { TestModule } from './test.module';
import { TestService } from './test.service';
import { NodeEnvironment } from '../config/app-config.service';

import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';

describe('ConfigModule imported by TestModule', () => {
    let app: INestApplication;
    let service: TestService;
    let otherService: OtherService;
    const logger = new Logger();

    beforeEach(async () => {
        process.env.REDIS_URL = 'IP:PORT';
        jest.spyOn(logger, 'warn');

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [TestModule],
        })
            .setLogger(logger)
            .compile();
        app = moduleFixture.createNestApplication();

        service = moduleFixture.get(TestService);
        otherService = moduleFixture.get(OtherService);

        await app.init();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('should provide configuration', () => {
        expect(service.appConfigService.env).toBe('test');
        expect(service.redisConfigService.url).toBe('IP:PORT');
    });

    it('should get all keys', () => {
        expect(service.appConfigService).toEqual({
            env: 'test',
            httpLogFormat: 'tiny',
            useSentry: false,
            sentryUrl: undefined,
            listeningPort: 3000,
            swaggerPath: 'api',
        });

        expect(service.redisConfigService).toEqual({
            url: 'IP:PORT',
            username: undefined,
            password: undefined,
            name: undefined,
            database: 0,
        });
    });

    it('should protect the value', async () => {
        expect(service.appConfigService.listeningPort).toBe(3000);
        expect(service.redisConfigService.url).toBe('IP:PORT');
        expect(() => {
            service.appConfigService.listeningPort = 1000;
        }).toThrow(TypeError);

        expect(() => {
            service.redisConfigService.url = 'redisUrl';
        }).toThrow(TypeError);
    });

    it('should be able change value only if it is valid', () => {
        expect(service.appConfigService.env).toEqual('test');
        expect(() => {
            service.appConfigService.changeValue('env', 'blabla');
        }).toThrow(ValidationError);

        otherService.setLocalEnvironment();

        expect(logger.warn).toHaveBeenCalledTimes(1);
        expect(logger.warn).toHaveBeenCalledWith("[AppConfigService] The value of key 'env' changed from 'test' to 'local'");
        expect(service.appConfigService.env).toEqual('local');
        expect(otherService.appConfigService.env).toEqual('local');

        expect(() => {
            service.appConfigService.env = NodeEnvironment.TEST;
        }).toThrow(TypeError);
        expect(service.appConfigService.env).toEqual('local');
    });

    it('should check if typeof key is string', () => {
        const definePropertySpy = jest.spyOn(Object, 'defineProperty');

        // @ts-expect-error In order to test the case when the type of key is not string
        service.appConfigService.changeValue(null, 'blabla');

        expect(definePropertySpy).toHaveBeenCalledTimes(1);
        expect(logger.warn).not.toHaveBeenCalled();
    });
});
