# @nestjs-library/config

<p align="center">
    <img src="https://github.com/woowabros/nestjs-library-config/actions/workflows/ci.yml/badge.svg" alt="Node.js CI">
    <a href='https://coveralls.io/github/woowabros/nestjs-library-config?branch=main'>
        <img src='https://coveralls.io/repos/github/woowabros/nestjs-library-config/badge.svg?branch=main' alt='Coverage Status' />
    </a>
    <a href="https://www.npmjs.com/package/@nestjs-library/config">
        <img src="https://img.shields.io/npm/v/@nestjs-library/config">
    </a>
    <a href="https://www.npmjs.com/package/@nestjs-library/config">
        <img src="https://img.shields.io/bundlephobia/minzip/@nestjs-library/config">
    </a>
    <a href="https://www.npmjs.com/package/@nestjs-library/config">
        <img src="https://img.shields.io/npm/dw/@nestjs-library/config">
    </a>        
</p>

A NestJS module for managing environment variables easily and securely.

## Features

-   Decentralizes environment variables by managing each as a provider
-   Protects changing values of environment variable by developer's mistake
-   Supports strong validation
-   Supports type inference
-   Supports modifying environment variables at runtime via remote config(such as Apache ZooKeeper etc)

### What Difference From [official library](https://docs.nestjs.com/techniques/configuration)

There is an `official library` ([@nestjs/config](https://docs.nestjs.com/techniques/configuration) ) for managing configurations for nestjs application

However, we hoped that configurations to be managed by each module. We thought it would be nice to have `simpler` and `easier way to validate` configurations and `infer type` of them.

Here is where `@nestjs-library/config` kicks in. Instead of looking for configuration from global, you can define own configurations `per module` and use it as you wish.

> nestjs/config

```ts
// in module
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        database: configService.get('DB_DATABASE'),
        password: configService.get('DB_PASSWORD'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      },
      inject: [ConfigService],
    }),
  ],
})

// in service
const foo = this.configService.get<string>('app.foo', { infer: true })
```

> nestjs-library/config

```ts
// in module
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule.forFeature(TypeORMConfigService)],
            useFactory: (typeORMConfigService: TypeORMConfigService) => typeORMConfigService,
            inject: [TypeORMConfigService],
        }),
    ],
})

// in service
const foo = this.testConfigService.foo;
```

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

We use `class-transformer` internally for transforming environment variables to Config Class. You can use decorators such as `@Expose` and `@Type` as your need.

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
    exports: [TestService],
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

## [Contributors](https://github.com/woowabros/nestjs-library-config/graphs/contributors)

![Contributors](https://contrib.rocks/image?repo=woowabros/nestjs-library-config)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=woowabros/nestjs-library-config&type=Date)](https://star-history.com/#woowabros/nestjs-library-config&Date)

## License

This library is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
