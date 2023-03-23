import { ProcessEnvSourceProvider } from './process-env-source-provider';

describe('ProcessEnvSourceProvider', () => {
    let orgEnv: NodeJS.ProcessEnv;

    beforeAll(() => {
        orgEnv = process.env;
        process.env = { TEST: 'value' };
    });

    afterAll(() => {
        process.env = orgEnv;
    });

    it('should configure configService from process.env', () => {
        expect(new ProcessEnvSourceProvider().export()).toEqual({ TEST: 'value' });
    });
});
