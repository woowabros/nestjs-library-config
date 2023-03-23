import { ProcessEnvSourceProvider } from './process-env-source-provider';

describe('process env provider의 동작을 검증합니다', () => {
    let orgEnv: NodeJS.ProcessEnv;

    beforeAll(() => {
        orgEnv = process.env;
        process.env = { TEST: 'value' };
    });

    afterAll(() => {
        process.env = orgEnv;
    });

    it('process.env 로 설정된 환경변수를 불러올 수 있습니다.', () => {
        expect(new ProcessEnvSourceProvider().export()).toEqual({ TEST: 'value' });
    });
});
