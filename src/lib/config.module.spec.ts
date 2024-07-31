import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Expose, Transform, Type } from 'class-transformer';
import { IsNumber, ValidationError } from 'class-validator';

import { AbstractConfigService } from './abstract/abstract-config.service';
import { ConfigModule } from './config.module';

import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';

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

    it('should throw when value is invalid', async () => {
        process.env.PORT = 'invalid';

        try {
            const moduleFixture: TestingModule = await Test.createTestingModule({
                imports: [ConfigModule.forFeature(ConfigService)],
            }).compile();
            app = moduleFixture.createNestApplication();

            await app.init();
        } catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
        } finally {
            await app?.close();
        }
    });
});
