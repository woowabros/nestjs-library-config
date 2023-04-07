import { Injectable } from '@nestjs/common';
import { Expose, Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

import { AbstractConfigService } from '../../src/lib/abstract/abstract-config.service';

@Injectable()
export class HideConfigService extends AbstractConfigService<HideConfigService> {
    @Expose({ name: 'LISTENING_PORT' })
    @Transform(({ value }) => value ?? 1234)
    @Type(() => Number)
    @IsPositive()
    @IsNotEmpty()
    hidePort: number;

    @Expose({ name: 'URL' })
    @Transform(({ value }) => value ?? 'default')
    @IsString()
    @IsOptional()
    hideUrl: string;

    @Expose({ name: 'HOST' })
    @Transform(({ value }) => value ?? 'default')
    @IsString()
    @IsOptional()
    hideHost: string;
}
