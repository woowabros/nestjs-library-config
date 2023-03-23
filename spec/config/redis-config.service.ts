import { Injectable } from '@nestjs/common';
import { Expose, Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { AbstractConfigService } from '../../src/lib/abstract/abstract-config.service';

@Injectable()
export class RedisConfigService extends AbstractConfigService<RedisConfigService> {
    @Expose({ name: 'REDIS_URL' })
    @IsString()
    @IsNotEmpty()
    url: string;

    @Expose({ name: 'REDIS_USERNAME' })
    @IsString()
    @IsOptional()
    username: string;

    @Expose({ name: 'REDIS_PASSWORD' })
    @IsString()
    @IsOptional()
    password: string;

    @Expose({ name: 'REDIS_NAME' })
    @IsString()
    @IsOptional()
    name: string;

    @Expose({ name: 'REDIS_DATABASE' })
    @Transform(({ value }) => value ?? 0)
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    database: number;
}
