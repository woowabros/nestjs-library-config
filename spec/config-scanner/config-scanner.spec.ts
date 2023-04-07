import { readFileSync, existsSync, unlinkSync } from 'fs';
import path from 'path';

import { ExampleConfigService } from './example.config.service';
import { ConfigScanner } from '../../src/lib/config-scanner';

describe('ConfigScanner', () => {
    const markdownFilename = 'README.md';
    const jsonFilename = 'env.json';

    afterEach(() => {
        try {
            if (existsSync(path.resolve(__dirname, markdownFilename))) {
                unlinkSync(path.resolve(__dirname, markdownFilename));
            }
            if (existsSync(path.resolve(__dirname, jsonFilename))) {
                unlinkSync(path.resolve(__dirname, jsonFilename));
            }
        } catch {
            // do noting
        }
    });

    it('should be executed without error', async () => {
        const scanner = new ConfigScanner({ sourceRoot: __dirname, outputDirectory: __dirname });
        await expect(scanner.execute()).resolves.toBeUndefined();
    });

    it(`should write configuration metadata on ${markdownFilename}`, async () => {
        const scanner = new ConfigScanner({ sourceRoot: __dirname, outputDirectory: __dirname });

        await expect(scanner.execute()).resolves.toBeUndefined();

        const filePath = path.resolve(__dirname, markdownFilename);
        const readme = readFileSync(filePath);

        expect(readme).not.toBeNull();
        expect(readme.includes('### Environments')).toEqual(true);
        expect(readme.includes('| name | groups | defaultValue | conditions |')).toEqual(true);
        expect(readme.includes(`| EXAMPLE_TIMEOUT | ${ExampleConfigService.name} | 35_000 | IsNumber, IsOptional |`)).toEqual(true);
        expect(readme.includes(`| EXAMPLE_WHITELIST | ${ExampleConfigService.name} | /health,/metrics | IsString, IsNotEmpty |`)).toEqual(
            true,
        );
        expect(readme.includes(`| EXAMPLE_DISABLED | ${ExampleConfigService.name} | true | IsBoolean, IsNotEmpty |`)).toEqual(true);
        expect(
            readme.includes(
                `| LOGGER_LEVELS | ${ExampleConfigService.name} | log,error,warn,debug,verbose | IsString, IsOptional, IsEnum |`,
            ),
        ).toEqual(true);
    });

    it(`should write configuration metadata on ${jsonFilename}`, async () => {
        const scanner = new ConfigScanner({ sourceRoot: __dirname, outputDirectory: __dirname, filename: jsonFilename });
        await expect(scanner.execute()).resolves.toBeUndefined();

        const jsonFile = readFileSync(path.resolve(__dirname, jsonFilename));
        const expected = {
            EXAMPLE_TIMEOUT: {
                defaultValue: '35_000',
                groups: [ExampleConfigService.name],
                conditions: ['IsNumber', 'IsOptional'],
            },
            EXAMPLE_WHITELIST: {
                defaultValue: '/health,/metrics',
                groups: [ExampleConfigService.name],
                conditions: ['IsString', 'IsNotEmpty'],
            },
            EXAMPLE_DISABLED: {
                defaultValue: 'true',
                groups: [ExampleConfigService.name],
                conditions: ['IsBoolean', 'IsNotEmpty'],
            },
            LOGGER_LEVELS: {
                defaultValue: 'log,error,warn,debug,verbose',
                groups: [ExampleConfigService.name],
                conditions: ['IsString', 'IsOptional', 'IsEnum'],
            },
        };

        expect(JSON.parse(jsonFile.toString())).toEqual(expected);
    });
});
