import { exec } from "child_process";
import { minimatch } from "minimatch";
import osPath from "path";
import { PluginContext } from "rollup";
import { promisify } from "util";
import { HmrContext, Plugin } from "vite";

const execAsync = promisify(exec);

const debounceMs = 100;

interface WayfinderOptions {
    patterns?: string[];
    actions?: boolean;
    routes?: boolean;
    formVariants?: boolean;
    path?: string;
    command?: string;
}

let context: PluginContext;

export const wayfinder = ({
    patterns = ["routes/**/*.php", "app/**/Http/**/*.php"],
    actions = true,
    routes = true,
    formVariants = false,
    path,
    command = "php artisan wayfinder:generate",
}: WayfinderOptions = {}): Plugin => {
    patterns = patterns.map((pattern) => pattern.replace("\\", "/"));

    const args: string[] = [];
    const generating: string[] = [];

    if (!actions) {
        args.push("--skip-actions");
    } else {
        generating.push("actions");
    }

    if (!routes) {
        args.push("--skip-routes");
    } else {
        generating.push("routes");
    }

    if (formVariants) {
        args.push("--with-form");
        generating.push("form variants");
    }

    if (path) {
        args.push(`--path=${path}`);
    }

    let serving = false;

    const generate = async () => {
        try {
            await execAsync(`${command} ${args.join(" ")}`);
        } catch (error) {
            context.error("Error generating types: " + error);
        }

        context.info(`Types generated for ${generating.join(", ")}`);
    };

    // Two runs writing the same output directory at once can leave torn files,
    // so every run queues behind the previous one.
    let tail: Promise<void> = Promise.resolve();

    const runCommand = () => {
        const result = tail.then(generate, generate);

        tail = result.catch(() => {});

        return result;
    };

    let timer: ReturnType<typeof setTimeout> | undefined;
    let pending: Promise<void> | undefined;
    let settle:
        | { resolve: () => void; reject: (error: unknown) => void }
        | undefined;

    const scheduleCommand = () => {
        pending ??= new Promise<void>((resolve, reject) => {
            settle = { resolve, reject };
        });

        clearTimeout(timer);

        timer = setTimeout(() => {
            const { resolve, reject } = settle!;

            pending = undefined;
            settle = undefined;

            runCommand().then(resolve, reject);
        }, debounceMs);

        return pending;
    };

    return {
        name: "@laravel/vite-plugin-wayfinder",
        enforce: "pre",
        configResolved(config) {
            serving = config.command === "serve";
        },
        buildStart() {
            context = this;
            return runCommand();
        },
        handleHotUpdate({ file, server }) {
            if (!shouldRun(patterns, { file, server })) {
                return;
            }

            return serving ? scheduleCommand() : runCommand();
        },
    };
};

const shouldRun = (
    patterns: string[],
    opts: Pick<HmrContext, "file" | "server">,
): boolean => {
    const file = opts.file.replaceAll("\\", "/");

    return patterns.some((pattern) => {
        pattern = osPath
            .resolve(opts.server.config.root, pattern)
            .replaceAll("\\", "/");

        return minimatch(file, pattern);
    });
};
