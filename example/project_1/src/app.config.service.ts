import { Injectable } from '@nestjs/common'
import { AbstractConfigService } from '@nestjs-library/config'
import { Expose, Transform, Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator'

@Injectable()
export class AppConfigService extends AbstractConfigService {
  @Expose({ name: 'PORT' })
  @Type(() => Number)
  @Transform(({ value }) => Number(value) ?? 3000)
  @IsNumber()
  port: number

  @Expose({ name: 'HEALTH_CHECK_PATH' })
  @IsString()
  @ValidateIf((_, value) => value !== undefined)
  @IsOptional()
  healthCheckPath: string
}
