import type { AbstractConfigSourceProvider } from '../abstract/abstract-config-source-provider';

export class ProcessEnvSourceProvider implements AbstractConfigSourceProvider {
    export(): NodeJS.ProcessEnv {
        return process.env;
    }
}
