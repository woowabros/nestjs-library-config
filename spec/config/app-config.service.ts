import { Injectable } from '@nestjs/common';
import { Expose, Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString, IsUrl, ValidateIf } from 'class-validator';

import { AbstractConfigService } from '../../src/lib/abstract/abstract-config.service';

export enum NodeEnvironment {
    DEVELOPMENT = 'development',
    PRODUCTION = 'production',
    STAGE = 'stage',
    QA = 'qa',
    LOCAL = 'local',
    TEST = 'test',
}

export enum MorganFormats {
    COMBINED = 'combined',
    COMMON = 'common',
    DEVELOPMENT = 'dev',
    SHORT = 'short',
    TINY = 'tiny',
}

@Injectable()
export class AppConfigService extends AbstractConfigService<AppConfigService> {
    @Expose({ name: 'NODE_ENV' })
    @Transform(({ value }) => value ?? NodeEnvironment.DEVELOPMENT)
    @IsEnum(NodeEnvironment)
    @IsNotEmpty()
    env: NodeEnvironment;

    @Expose({ name: 'HTTP_LOG_FORMAT' })
    @Transform(({ value }) => value ?? MorganFormats.TINY)
    @IsEnum(MorganFormats)
    @IsNotEmpty()
    httpLogFormat: MorganFormats;

    @IsBoolean()
    @Transform(({ value }) => (value ?? 'false') !== 'false')
    @Expose({ name: 'USE_SENTRY' })
    useSentry: boolean;

    @Expose({ name: 'SENTRY_URL' })
    @IsUrl()
    @ValidateIf((o) => o.USE_SENTRY === true || o.USE_SENTRY === 'true')
    @IsNotEmpty()
    sentryUrl: string;

    @Expose({ name: 'LISTENING_PORT' })
    @Transform(({ value }) => value ?? 3000)
    @Type(() => Number)
    @IsNumber()
    listeningPort: number;

    @Expose({ name: 'SWAGGER_PATH' })
    @Transform(({ value }) => value ?? 'api')
    @IsString()
    swaggerPath: string;
}
