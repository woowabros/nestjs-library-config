import { Injectable } from '@nestjs/common';
import { Expose, Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

import { AbstractConfigService } from '../../src/lib/abstract/abstract-config.service';

@Injectable()
export class ConfigService extends AbstractConfigService<ConfigService> {
    @Expose({ name: 'LISTENING_PORT' })
    @Type(() => Number)
    @IsPositive()
    @IsNotEmpty()
    port: number;

    @Expose({ name: 'URL' })
    @IsString()
    @IsOptional()
    url: string;

    @Expose({ name: 'HOST' })
    @Transform(({ value }) => value ?? 'default')
    @IsString()
    @IsOptional()
    host: string;
}
