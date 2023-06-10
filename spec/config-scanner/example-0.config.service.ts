import { Expose, Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

import { AbstractConfigService } from '../../src';

export class Example0ConfigService extends AbstractConfigService<Example0ConfigService> {
    @Expose({ name: 'EXAMPLE_TIMEOUT' })
    @Transform(({ value }) => value ?? 35_000)
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    timeout: number;

    @Expose({ name: 'ABCD' })
    @Transform(({ value }) => value ?? 35_000)
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    abcd: number;
}
