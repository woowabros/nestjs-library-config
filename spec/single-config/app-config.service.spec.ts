import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigModule } from '../../src/lib/config.module';
import { AppConfigService } from '../config/app-config.service';

describe('Single Config', () => {
    let app: INestApplication;
    let service: AppConfigService;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forFeature(AppConfigService)],
        }).compile();
        app = moduleFixture.createNestApplication();

        service = moduleFixture.get<AppConfigService>(AppConfigService);
        await app.init();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('should provide configuration', async () => {
        expect(service.env).toBe('test');
    });
});
