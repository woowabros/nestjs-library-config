import { ConsoleLogger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { HideConfigService } from './hide-config.service';
import { LoggingConfigService } from './logging-config.service';
import { ConfigModule } from '../../src';

describe('Log Message', () => {
    it('should be logging message occurs after app.init()', async () => {
        const logger = new ConsoleLogger();
        logger.setLogLevels(['error']); // not be printed to the screen
        const loggerSpy: jest.SpyInstance = jest.spyOn(logger, 'log');
        const app = await Test.createTestingModule({
            imports: [ConfigModule.forFeature(LoggingConfigService), ConfigModule.forFeature(HideConfigService, {})],
        })
            .setLogger(logger)
            .compile();

        const loggingInstanceLoader = 3;
        expect(loggerSpy).toHaveBeenCalledTimes(loggingInstanceLoader);

        await app.init();

        const logging = [
            '[LoggingConfigService] loggingPort: 1234',
            '[LoggingConfigService] loggingUrl: default',
            '[LoggingConfigService] loggingHost: default',
            '[HideConfigService] hidePort: 1234',
            '[HideConfigService] hideUrl: default',
            '[HideConfigService] hideHost: default',
        ];
        expect(loggerSpy).toHaveBeenCalledTimes(logging.length + loggingInstanceLoader);

        for (const [index, message] of logging.entries()) {
            expect(loggerSpy).toHaveBeenNthCalledWith(index + loggingInstanceLoader + 1, message);
        }

        await app.close();
    });
});
