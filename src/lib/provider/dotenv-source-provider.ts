import { existsSync } from 'fs';
import os from 'os';
import path from 'path';

import dotenv from 'dotenv';

import { AbstractConfigSourceProvider } from '../abstract/abstract-config-source-provider';

export class DotenvSourceProvider implements AbstractConfigSourceProvider {
    constructor(private readonly options?: dotenv.DotenvConfigOptions) {}

    // @ts-expect-error TODO: modify AbstractConfigSourceProvider.export method's signature to cover throw case
    export() {
        if (this.options?.path && !this.existsFile(this.options.path)) {
            throw new Error(`Not Found File ${this.options.path}`);
        }
        return dotenv.config(this.options).parsed;
    }

    /**
     * @description reference: `_resolveHome` function (https://github.com/motdotla/dotenv/blob/5037df12d5aa320f4ae7ea9ec67d9581d7ac7fc2/lib/main.js#L53-L55)
     */
    private existsFile(envPath: string): boolean {
        const homeResolved = envPath.startsWith('~') ? path.join(os.homedir(), envPath.slice(1)) : envPath;
        return existsSync(homeResolved);
    }
}
