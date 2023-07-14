import { DynamicModule, FactoryProvider, Logger, Type } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { AbstractConfigSourceProvider } from './abstract/abstract-config-source-provider';
import { AbstractConfigService } from './abstract/abstract-config.service';
import { ProcessEnvSourceProvider } from './provider/process-env-source-provider';

export interface ConfigModuleOptions {
    sourceProvider?: AbstractConfigSourceProvider;
    global?: boolean;
}

export class ConfigModule {
    static forFeature(
        configClass: Type<AbstractConfigService> | Array<Type<AbstractConfigService>>,
        options?: ConfigModuleOptions,
    ): DynamicModule {
        const sourceProvider = options?.sourceProvider ?? new ProcessEnvSourceProvider();

        const providers: Array<FactoryProvider<AbstractConfigService>> = Array.isArray(configClass)
            ? configClass.map((config) => ConfigModule.createConfig(config, sourceProvider))
            : [ConfigModule.createConfig(configClass, sourceProvider)];

        return {
            module: ConfigModule,
            providers,
            exports: providers,
            global: options?.global ?? false,
        };
    }

    private static createConfig(
        configClass: Type<AbstractConfigService>,
        sourceProvider: AbstractConfigSourceProvider,
    ): FactoryProvider<AbstractConfigService> {
        return {
            provide: configClass,
            useFactory: () => {
                const obj = plainToInstance(configClass, sourceProvider.export(), { excludeExtraneousValues: true });
                const [error] = validateSync(obj, { stopAtFirstError: true });
                if (error) {
                    Logger.error(
                        `[ConfigMemberValidationError] class: ${configClass.name}, validationError: ${JSON.stringify(error, null, 2)}`,
                    );
                    throw error;
                }

                for (const [key, value] of Object.entries(obj)) {
                    Object.defineProperty(obj, key, {
                        get() {
                            return value;
                        },
                    });
                }
                return obj;
            },
        };
    }
}
