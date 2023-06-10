import { Expose, Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

import { AbstractConfigService } from '../../src';

export class Example9ConfigService extends AbstractConfigService<Example9ConfigService> {
    @Expose({ name: 'EXAMPLE_TIMEOUT' })
    @Transform(({ value }) => value ?? 35_000)
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    timeout: number;

    @Expose({ name: 'A10' })
    @Transform(({ value }) => value ?? 35_000)
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    abcd: number;
}
