import { existsSync, readFileSync, writeFileSync } from 'fs';
import { readdir } from 'fs/promises';
import path from 'path';

import { isNil } from 'lodash';
import ts from 'typescript';

const NEW_LINE = '\n';
const enum ConfigFile {
    SUFFIX = 'config.service.ts',
    CONFIG_SERVICE_CLASS_NAME_SUFFIX = 'ConfigService',
    CONFIG_CLASS_NAME_SUFFIX = 'Config',
    ABSTRACT_CLASS = 'AbstractConfigService',
}
const enum FileType {
    MARKDOWN = 'md',
    JSON = 'json',
}
const enum Decorator {
    EXPOSE = 'Expose',
    TRANSFORM = 'Transform',
    IS_ENUM = 'IsEnum',
    PREFIX_CONDITION = 'Is',
}
const MARKDOWN_FORMAT = {
    defaultFileName: 'README.md',
    title: '### Environments',
    headers: ['name', 'groups', 'defaultValue', 'conditions'],
    columns: ' | ',
    rowDash: '---',
};

export interface ConfigScannerOptions {
    /**
     * root directory of the project to scan configurations
     */
    sourceRoot: string;
    /**
     * directory to write the output file
     */
    outputDirectory?: string;
    /**
     * filename of the output file
     * @example `README.md`, `env.json`
     */
    filename?: string;
}

export class ConfigScanner {
    private sourceRoot: string;
    private outputPath: string;
    private filename: string;
    private fileType: FileType;
    private checker: ts.TypeChecker;
    private variableMap: Map<string, string>;
    private environmentMap: Map<string, EnvironmentMapValue>;

    constructor(configScannerOptions: ConfigScannerOptions) {
        this.sourceRoot = configScannerOptions.sourceRoot;
        this.outputPath = configScannerOptions.outputDirectory ?? path.parse(this.sourceRoot).dir;

        this.filename = configScannerOptions.filename ?? MARKDOWN_FORMAT.defaultFileName;
        this.checkFileFormat(this.filename);

        this.environmentMap = new Map();
    }

    private checkFileFormat(filename: string) {
        if (filename?.endsWith('.md')) {
            this.fileType = FileType.MARKDOWN;
            return;
        }
        if (filename?.endsWith('.json')) {
            this.fileType = FileType.JSON;
            return;
        }

        throw new Error(`Unsupported file format (${filename})`);
    }

    async execute() {
        const configFiles = await this.getConfigFiles(this.sourceRoot);
        await this.fillEnvironmentMap(configFiles, {});

        if (this.fileType === FileType.MARKDOWN) {
            this.writeReadme();
        } else {
            this.writeJson();
        }
    }

    async getConfigFiles(pathStr: string): Promise<string[]> {
        const contents = await readdir(pathStr, { withFileTypes: true });
        const files = await Promise.all(
            contents.map((content) => {
                const contentPath = path.resolve(pathStr, content.name);
                return content.isDirectory() ? this.getConfigFiles(contentPath) : contentPath;
            }),
        );
        return files.flat().filter((filename) => filename.endsWith(ConfigFile.SUFFIX));
    }

    private writeJson() {
        const filePath = path.resolve(this.outputPath, this.filename);
        const content: Record<string, EnvironmentMapValue> = {};
        for (const [key, value] of this.environmentMap.entries()) {
            content[key] = value;
        }
        writeFileSync(filePath, JSON.stringify(content, undefined, 4));

        return filePath;
    }

    private writeReadme() {
        const filePath = path.resolve(this.outputPath, this.filename);
        let readmeData = existsSync(filePath) ? readFileSync(filePath, 'utf-8') : '';

        const tableHeader =
            ['', ...MARKDOWN_FORMAT.headers, ''].join(MARKDOWN_FORMAT.columns).trim() +
            NEW_LINE +
            ['', ...new Array(MARKDOWN_FORMAT.headers.length).fill(MARKDOWN_FORMAT.rowDash), ''].join(MARKDOWN_FORMAT.columns).trim();

        const tableBody = [];
        for (const [key, value] of this.environmentMap.entries()) {
            tableBody.push(
                [
                    '',
                    key,
                    value.groups.map((group) => group).join(', '),
                    value.defaultValue ?? '',
                    value.conditions.map((group) => group).join(', '),
                    '',
                ]
                    .join(MARKDOWN_FORMAT.columns)
                    .trim(),
            );
        }

        if (readmeData.includes(MARKDOWN_FORMAT.title)) {
            const lines = readmeData.split(NEW_LINE);
            let isOverrideSection = false;
            readmeData = lines
                .reduce((filteredData: string[], line) => {
                    if (line.includes(MARKDOWN_FORMAT.title)) {
                        isOverrideSection = true;
                        return filteredData;
                    }
                    if (isOverrideSection) {
                        if (!line || line.includes('|')) {
                            return filteredData;
                        } else {
                            isOverrideSection = false;
                            if (!line) {
                                filteredData.push(line);
                            }
                            return filteredData;
                        }
                    }
                    filteredData.push(line);
                    return filteredData;
                }, [])
                .join(NEW_LINE);
        }

        writeFileSync(filePath, [readmeData, MARKDOWN_FORMAT.title, '', tableHeader, tableBody.join(NEW_LINE), ''].join(NEW_LINE));
    }

    private async fillEnvironmentMap(fileNames: string[], options: ts.CompilerOptions) {
        const program = ts.createProgram(fileNames, options);
        this.checker = program.getTypeChecker();
        this.variableMap = new Map();

        const visit = (node: ts.Node) => {
            if (!this.isNodeExported(node)) {
                return;
            }

            switch (node.kind) {
                case ts.SyntaxKind.VariableStatement: {
                    for (const declaration of (node as ts.VariableStatement).declarationList.declarations) {
                        if (!declaration.initializer) {
                            continue;
                        }
                        const identifier = declaration.name as ts.Identifier;
                        const pos = declaration.initializer.pos - identifier.pos;
                        const end = declaration.initializer.end - declaration.initializer.pos + pos;
                        const value = this.convertValue<any>(declaration.getText().slice(pos, end));
                        this.variableMap.set(identifier.text, Array.isArray(value) ? value.toLocaleString() : value);
                    }
                    break;
                }
                case ts.SyntaxKind.ClassDeclaration: {
                    const envList = this.serializeClass(node as ts.ClassDeclaration);
                    if (!envList) return;
                    for (const { group, ...env } of envList) {
                        this.updateOrInsertEnvironmentMap(env, group);
                    }

                    break;
                }
                case ts.SyntaxKind.ModuleDeclaration: {
                    ts.forEachChild(node, visit);

                    break;
                }
                // No default
            }
        };

        for (const sourceFile of program.getSourceFiles()) {
            ts.forEachChild(sourceFile, visit);
        }
    }

    serializeClass(node: ts.ClassDeclaration): Array<EnvironmentVariable & { group: string }> | undefined {
        if (!node.name) {
            return;
        }
        const symbol = this.checker.getSymbolAtLocation(node.name);

        const group = symbol?.getName();
        if (
            !group ||
            !(group.endsWith(ConfigFile.CONFIG_SERVICE_CLASS_NAME_SUFFIX) || group.endsWith(ConfigFile.CONFIG_CLASS_NAME_SUFFIX))
        ) {
            return;
        }
        const extendedClass = node.heritageClauses?.[0].types?.[0].expression.getText();
        if (extendedClass !== ConfigFile.ABSTRACT_CLASS) {
            return;
        }
        console.log('\u001B[32m', `serializing ${group}`);

        const result: Array<EnvironmentVariable & { group: string }> = [];
        for (const member of node.members) {
            const variable = this.visitPropertyDeclaration(member);
            if (variable) result.push({ ...variable, group });
        }

        return result;
    }

    private visitPropertyDeclaration(propertyDeclaration: ts.Node): EnvironmentVariable | undefined {
        if (propertyDeclaration.kind !== ts.SyntaxKind.PropertyDeclaration) {
            return;
        }

        const env: EnvironmentVariable = { name: '', defaultValue: undefined, conditions: [] };

        const modifiers = (propertyDeclaration as ts.PropertyDeclaration).modifiers;
        if (!modifiers) {
            return;
        }
        for (const modifier of modifiers) {
            const callExpressionNode = (modifier as ts.Decorator).expression;
            if (!(modifier.kind === ts.SyntaxKind.Decorator && callExpressionNode.kind === ts.SyntaxKind.CallExpression)) {
                continue;
            }

            const nameOfDecorator = ((callExpressionNode as ts.CallExpression).expression as ts.Identifier).escapedText;
            const argumentNode = (callExpressionNode as ts.CallExpression).arguments[0];

            if (isNil(argumentNode)) {
                env.conditions.push(nameOfDecorator as string);
                continue;
            }

            switch (argumentNode.kind) {
                /**
                 * Get name of environment variable from @Expose decorator
                 * @Expose({ name: 'WARRANTY_EXPIRATION_STOCK_REGION' })
                 */
                case ts.SyntaxKind.ObjectLiteralExpression: {
                    if ((nameOfDecorator as string).startsWith(Decorator.PREFIX_CONDITION)) {
                        env.conditions.push(nameOfDecorator as string);
                        break;
                    }
                    if (nameOfDecorator !== Decorator.EXPOSE) {
                        continue;
                    }

                    env.name = ((argumentNode as ts.ObjectLiteralExpression).properties[0] as ts.PropertyAssignment).initializer
                        .getText()
                        .replace(/^'(.*)'$/, '$1');

                    break;
                }
                /**
                 * Get default value from @Transform decorator
                 * case 1. @Transform(({ value }) => value ?? 'ap-northeast-2')
                 * case 2. @Transform(({ value }) => Number(value ?? 300))
                 * case 2. @Transform(({ value }) => Boolean(value ?? true))
                 * case 3. @Transform(({ value }) => (value ?? '/health,/metrics').split(','))
                 */
                case ts.SyntaxKind.ArrowFunction: {
                    if (nameOfDecorator !== Decorator.TRANSFORM) {
                        continue;
                    }

                    let defaultValue = 'unknown';
                    const body = (argumentNode as ts.ArrowFunction).body;

                    // case 1.
                    if (body.kind === ts.SyntaxKind.BinaryExpression) {
                        const text = ((argumentNode as ts.ArrowFunction).body as ts.BinaryExpression).right.getText();
                        defaultValue = text.includes('\n') ? this.convertValue<string>(text).toString() : text.replace(/'(.*)'$/, '$1');
                    } else if (body.kind !== ts.SyntaxKind.CallExpression) {
                        env.defaultValue = defaultValue;
                        break;
                    } else if ((body as unknown as ts.CallExpression).arguments[0].kind === ts.SyntaxKind.BinaryExpression) {
                        // case 2.
                        const binExp = (body as unknown as ts.CallExpression).arguments[0] as ts.BinaryExpression;
                        defaultValue = binExp.right.getText().replace(/^'(.*)'$/, '$1');
                    } else if ((body as unknown as ts.CallExpression).expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
                        // case 3.
                        const nullishDefaultValue = (
                            (body as unknown as ts.CallExpression).expression as unknown as ts.PropertyAccessExpression
                        ).expression
                            .getText()
                            .match(/\((.*)(\?\?)(.*)\)/)
                            ?.pop()
                            ?.trim();

                        if (nullishDefaultValue) {
                            defaultValue = nullishDefaultValue;
                        }
                    }

                    if (defaultValue.startsWith("'") && defaultValue.at(0) === defaultValue.at(-1)) {
                        defaultValue = this.convertValue(defaultValue);
                    }
                    env.defaultValue = this.variableMap.get(defaultValue) ?? defaultValue;
                    break;
                }
                /**
                 * Get enum data from @IsEnum decorator
                 */
                case ts.SyntaxKind.Identifier: {
                    if (nameOfDecorator !== Decorator.IS_ENUM) {
                        continue;
                    }
                    env.conditions.push(nameOfDecorator);
                    break;
                }
                default: {
                    console.warn(`passed ${nameOfDecorator} decorator. Please check it.`);
                    break;
                }
            }
        }

        return env;
    }

    private updateOrInsertEnvironmentMap({ name, defaultValue, conditions }: EnvironmentVariable, group: string) {
        if (this.environmentMap.has(name)) {
            this.environmentMap.get(name)?.groups.push(group);
            return;
        }

        this.environmentMap.set(name, {
            defaultValue: defaultValue,
            groups: [group],
            conditions: conditions,
        });
    }

    private isNodeExported(node: ts.Node): boolean {
        return (node.flags & ts.NodeFlags.ExportContext) !== 0 || (node.parent && node.parent.kind === ts.SyntaxKind.SourceFile);
    }

    private convertValue<T>(value: string): T {
        try {
            return new Function(`return ${value}`)();
        } catch {
            return value as unknown as T;
        }
    }
}

interface EnvironmentVariable {
    name: string;
    defaultValue: unknown;
    conditions: string[];
}

type EnvironmentMapValue = Omit<EnvironmentVariable, 'name'> & { groups: string[] };
