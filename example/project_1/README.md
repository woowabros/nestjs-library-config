### Environments

| name              | groups                                                                               | defaultValue | conditions           |
| ----------------- | ------------------------------------------------------------------------------------ | ------------ | -------------------- |
|                   | AwsS3ConfigService, AwsS3ConfigService, DatabaseConfigService, DatabaseConfigService |              | Expose, IsString     |
| HEALTH_CHECK_PATH | AppConfigService                                                                     |              | IsString, IsOptional |
| PORT              | AppConfigService                                                                     | 3000         | IsNumber             |
