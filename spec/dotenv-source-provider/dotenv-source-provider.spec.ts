import path from 'path';

import { DotenvSourceProvider } from '../../src/lib/provider/dotenv-source-provider';

describe('dotenv provider의 동작을 검증합니다', () => {
    it('파일이 없을때 error를 throw 하여야 합니다', () => {
        expect(() => new DotenvSourceProvider({ path: './not-found-file.env' }).export()).toThrowError();
    });

    it('환경 변수 파일을 로드할 수 있습니다', () => {
        const absPath = path.join(__dirname, 'test.env');
        expect(new DotenvSourceProvider({ path: absPath }).export()).toEqual({
            LISTENING_PORT: '9999',
            REDIS_URL: 'hello',
        });
    });
});
