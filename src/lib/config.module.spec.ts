import { INestApplication, Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Expose, Transform, Type } from 'class-transformer';
import { IsNumber, ValidationError } from 'class-validator';

import { AbstractConfigService } from './abstract/abstract-config.service';
import { ConfigModule } from './config.module';

describe('ConfigModule', () => {
    let app: INestApplication;

    @Injectable()
    class ConfigService extends AbstractConfigService<ConfigService> {
        @Expose({ name: 'PORT' })
        @Transform(({ value }) => value ?? 3000)
        @Type(() => Number)
        @IsNumber()
        port: number;
    }

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forFeature(ConfigService)],
        }).compile();
        app = moduleFixture.createNestApplication();
    });

    it('should throw when value is invalid', async () => {
        process.env.PORT = 'invalid';

        try {
            await app.init();
        } catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
        } finally {
            await app?.close();
        }
    });

    it('should return default value when value is undefined', async () => {
        delete process.env.PORT;

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forFeature(ConfigService)],
        }).compile();
        app = moduleFixture.createNestApplication();

        await app.init();

        const configService = app.get(ConfigService);

        expect(configService.port).toBe(3000);

        await app.close();
    });
});
