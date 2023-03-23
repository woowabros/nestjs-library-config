# @nestjs-library/config

A NestJS module for managing environment variables easily and securely.

## Features

- Decentralizes environment variables by managing each as a provider
- Protects changing values of environment variable by developer's mistake
- Supports strong validation
- Supports type inference
- Supports modifying environment variables at runtime via remote config(such as Apache ZooKeeper etc).

## Installation

```bash
# npm
npm install @nestjs-library/config

# yarn
yarn add @nestjs-library/config

# pnpm
pnpm add @nestjs-library/config
```

## Usage

### Step 1. Create a Config service

In `@nestjs-library/config`, each environment variable is managed by a provider. So, you should create a config service first.

We use `class-transformer` internally for transforming environment variables to Config Class. You can use decorators such as  `@Expose` and `@Type` as your need.

```ts
// database-config.service.ts
import { Injectable } from '@nestjs/common';
import { AbstractConfigService } from '@nestjs-library/config';
import { Expose, Type } from 'class-transformer';

@Injectable()
export class DatabaseConfigService extends AbstractConfigService<DatabaseConfigService> {
    @Expose({ name: 'DATABASE_HOST' })
    host: string;

    @Expose({ name: 'DATABASE_PORT' })
    @Type(() => Number)
    port: number;

    @Expose({ name: 'DATABASE_PASSWORD' })
    password: string;
}
```

### Step 2. Add decorator for validation and default value

You can use decorators from `class-validator` for validation and `@Transform()` decorator of `class-transformer` for providing default value.

```ts
// database-config.service.ts
import { Injectable } from '@nestjs/common';
import { AbstractConfigService } from '@nestjs-library/config';
import { Expose, Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

@Injectable()
export class DatabaseConfigService extends AbstractConfigService<DatabaseConfigService> {
    @Expose({ name: 'DATABASE_HOST' })
    @Transform(({ value }) => value ?? 'localhost')
    @IsString()
    @IsNotEmpty()
    host: string;

    @Expose({ name: 'DATABASE_PORT' })
    @Type(() => Number)
    @Transform(({ value }) => value ?? 5532)
    @IsPositive()
    port: number;

    @Expose({ name: 'DATABASE_PASSWORD' })
    @Transform(({ value }) => value ?? 'local')
    @IsString()
    @IsNotEmpty()
    password: string;
}
```


### Step 3. Import Config module into your module

```ts
// test.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs-library/config';

import { DatabaseConfigService } from './database-config.service';
import { TestService } from './test.service';

@Module({
    imports: [ConfigModule.forFeature(DatabaseConfigService)],
    providers: [TestService],
    exports: [TestService,]
})
export class TestModule {}
```

### Step 4. Inject Config service where you need

```ts
// test.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseConfigService } from './database-config.service';

@Injectable()
export class TestService {
    constructor(private readonly databaseConfigService: DatabaseConfigService) {}

    getDatabaseConfig() {
        return this.databaseConfigService;
    }
}
```

## Contributing

(To be added)

## License

This library is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
