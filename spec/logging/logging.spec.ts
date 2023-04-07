import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { HideConfigService } from './hide-config.service';
import { LoggingConfigService } from './logging-config.service';
import { ConfigModule } from '../../src';

describe('Logging Option', () => {
    it('should be output debugging logs when logging is not false', async () => {
        const logger = new Logger();
        const loggerSpy: jest.SpyInstance = jest.spyOn(logger, 'log');
        await Test.createTestingModule({
            imports: [
                ConfigModule.forFeature(LoggingConfigService),
                ConfigModule.forFeature(HideConfigService, {
                    logging: false,
                }),
            ],
        })
            .setLogger(logger)
            .compile();

        const logging = [
            '[ConfigModule] Read Environment from LoggingConfigService',
            '[LoggingConfigService] loggingPort: 1234',
            '[LoggingConfigService] loggingUrl: default',
            '[LoggingConfigService] loggingHost: default',
        ];
        expect(loggerSpy).toHaveBeenCalledTimes(logging.length);

        for (const [index, message] of logging.entries()) {
            expect(loggerSpy).toHaveBeenNthCalledWith(index + 1, message);
        }
    });
});
