import { ConfigScanner } from '..';

/**
 * @description This is an example of using `ConfigScanner` to scan a project's configurations. Here `sourceRoots` denotes the root directories to scan which is comma-seprated value.
 * @example
 * ```sh
 * # npx ts-node run-config-scanner.ts <sourceRoots>
 * npx ts-node run-config-scanner.ts repo/app1/src,repo/app2/src
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
