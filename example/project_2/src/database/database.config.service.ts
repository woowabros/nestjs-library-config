import { Injectable } from "@nestjs/common";
import { AbstractConfigService } from "@nestjs-library/config";
import { Expose, Transform, Type } from "class-transformer";
import { IsBoolean, IsString } from "class-validator";

@Injectable()
export class DatabaseConfigService extends AbstractConfigService {
  @Expose()
  @IsString()
  url: string;

  @Expose()
  @IsBoolean()
  @Type(() => Boolean)
  @Transform(({ value }) =>
    value === undefined
      ? false
      : value === "true" || value === true
      ? true
      : false
  )
  logging: boolean;
}
