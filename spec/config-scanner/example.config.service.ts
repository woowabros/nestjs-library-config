import { LogLevel } from '@nestjs/common';
import { Expose, Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { AbstractConfigService } from '../../src';

const LOG_LEVELS: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];
export class ExampleConfigService extends AbstractConfigService<ExampleConfigService> {
    @Expose({ name: 'EXAMPLE_TIMEOUT' })
    @Transform(({ value }) => value ?? 35_000)
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    timeout: number;

    @Expose({ name: 'EXAMPLE_WHITELIST' })
    @Transform(({ value }) => (value ?? '/health,/metrics').split(','))
    @IsString({ each: true })
    @IsNotEmpty()
    whitelist: string[];

    @Expose({ name: 'EXAMPLE_DISABLED' })
    @Transform(({ value }) => Boolean(value ?? true))
    @IsBoolean()
    @IsNotEmpty()
    disabled: boolean;

    @Expose({ name: 'LOGGER_LEVELS' })
    @Transform(({ value }) => (value && value.split(',')) ?? LOG_LEVELS)
    @IsString({ each: true })
    @IsOptional()
    @IsEnum(LOG_LEVELS, { each: true })
    logLevels: LogLevel[];
}
