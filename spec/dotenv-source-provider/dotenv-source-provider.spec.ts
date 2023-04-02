import path from 'path';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from './config.service';
import { ConfigModule } from '../../src';
import { DotenvSourceProvider } from '../../src/lib/provider/dotenv-source-provider';

describe('DotenvSourceProvider', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forFeature(ConfigService, {
                    sourceProvider: new DotenvSourceProvider({ path: path.join(__dirname, 'test.env') }),
                }),
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        await app?.close();
    });

    it('should configure ConfigService from env file', () => {
        const service = app.get<ConfigService>(ConfigService);
        expect(service).toEqual({
            port: 9999,
            url: 'hello',
            host: 'default',
        });
    });

    describe('features of DotenvSourceProvider', () => {
        it('should load environment file', () => {
            const absPath = path.join(__dirname, 'test.env');
            expect(new DotenvSourceProvider({ path: absPath }).export()).toEqual({
                LISTENING_PORT: '9999',
                URL: 'hello',
            });
        });

        it('should be through error, when file is not exist', () => {
            expect(() => new DotenvSourceProvider({ path: './not-found-file.env' }).export()).toThrowError();
        });
    });
});
