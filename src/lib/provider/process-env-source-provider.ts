import { AbstractConfigSourceProvider } from '../abstract/abstract-config-source-provider';

export class ProcessEnvSourceProvider implements AbstractConfigSourceProvider {
    export() {
        return process.env;
    }
}
