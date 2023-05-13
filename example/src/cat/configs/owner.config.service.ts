import { AbstractConfigService, OptionalBoolean } from '@nestjs-library/config';
import { Expose, Transform, Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsMobilePhone } from 'class-validator';

export class OwnerConfigService extends AbstractConfigService<OwnerConfigService> {
  @Expose({ name: 'OWNER_EMAIL_ADDRESS' }) // transform
  @Transform(({ value }) => value) // transform
  @IsEmail() // validation
  email: string;

  @Expose({ name: 'OWNER_MOBILE_NUMBER' }) // transform
  @Type(() => String) // transform
  @IsMobilePhone() // validation
  mobile: string;

  @Expose({ name: 'OWNER_IS_VETERNARIAN' }) // transform
  @Transform(({ value }) => OptionalBoolean(value) ?? false) // transform
  @IsBoolean() // validation
  isVet: boolean;
}
