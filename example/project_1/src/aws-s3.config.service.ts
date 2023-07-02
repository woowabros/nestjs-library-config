import { Injectable } from '@nestjs/common'
import { AbstractConfigService } from '@nestjs-library/config'
import { Expose } from 'class-transformer'
import { IsString } from 'class-validator'

@Injectable()
export class AwsS3ConfigService extends AbstractConfigService {
  @Expose()
  @IsString()
  accessKeyId: string

  @Expose()
  @IsString()
  secretAccessKey: string
}
