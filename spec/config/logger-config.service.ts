import { Injectable } from '@nestjs/common';
import { Expose, Transform, Type } from 'class-transformer';
import { IsEnum } from 'class-validator';

import { LogLevel } from './log-level.enum';
import { AbstractConfigService } from '../../src';

@Injectable()
export class LoggerConfigService extends AbstractConfigService<LoggerConfigService> {
    @Expose({ name: 'LOG_LEVEL' })
    @Transform(({ value }) => value ?? LogLevel.INFO)
    @Type(() => Number)
    @IsEnum(LogLevel)
    logLevel: LogLevel;
}
