import { ConfigScanner } from '..';

/**
 * @description It is an example of how to use the ConfigScanner class to scan the source code of a project via script.
 * @example
 * ```sh
 * $ npx ts-node run-config-scanner.ts repo/app1/src,repo/app2/src
 * ```
 */
async function run() {
    const args = process.argv.slice(2);
    if (args.length === 0) return;
    const sourceRoots = args[0].split(',');

    for await (const sourceRoot of sourceRoots) {
        const configScanner = new ConfigScanner({ sourceRoot });
        await configScanner.execute();
    }
}

run()
    .then(() => {
        console.log('\u001B[35m', 'Done');
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
