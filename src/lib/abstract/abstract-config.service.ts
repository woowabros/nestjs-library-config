import { Logger } from '@nestjs/common';
import { validateSync } from 'class-validator';
import { cloneDeep } from 'lodash';

import type { OnModuleInit } from '@nestjs/common';

export abstract class AbstractConfigService<K = Record<string, unknown>> implements OnModuleInit {
    onModuleInit(): void {
        this.showAll();
    }

    changeValue(key: keyof K, value: unknown): void {
        const obj = cloneDeep(this);
        Object.defineProperty(obj, key, { value });
        const [error] = validateSync(obj, { stopAtFirstError: true });
        if (error) {
            throw error;
        }

        if (key == null || typeof key !== 'string') {
            return;
        }
        Logger.warn(
            `[${this.constructor.name}] The value of key '${key}' changed from '${(this as Record<string, any>)[key]}' to '${value}'`,
        );
        Object.defineProperty(this, key, {
            get() {
                return value;
            },
        });
    }

    showAll(): void {
        const obj = cloneDeep(this);
        for (const [key, value] of Object.entries(obj)) {
            Logger.log(`[${this.constructor.name}] ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
        }
    }
}
