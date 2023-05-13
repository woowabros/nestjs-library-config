import { Expose, Transform, Type } from 'class-transformer';
import { IsInt, IsNumber, IsPositive } from 'class-validator';
import { AbstractConfigService } from '@nestjs-library/config';

export class PetConfigService extends AbstractConfigService<PetConfigService> {
  @Expose({ name: 'PET_MAX_AGE' }) // transform
  @Transform(({ value }) => value ?? 15) // transform
  @IsPositive() // validation
  @IsInt() // validation
  maxAge: number;

  @Expose({ name: 'PET_MAX_WEIGHT_KG' }) // transform
  @Transform(({ value }) => value ?? 20) // transform
  @Type(() => Number) // transform
  @IsPositive() // validation
  @IsNumber() // validation
  maxWeightKg: number;
}
