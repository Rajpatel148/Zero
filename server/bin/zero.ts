#!/usr/bin/env node

import { Command } from "commander";
import { execSync } from "child_process";
import fs from "fs";
import crypto from "crypto";
import path from "path";
import { validateYaml } from "../src/validator/index.js";
import { zeroEngine } from "../src/engine/index.js";
import prompts from "prompts";
import yaml from "js-yaml";

export let BASE_PATH: string = process.cwd();
type GenerateOptions = {
    config: string;
    resume?: boolean;
    fresh?: boolean;
};

const program = new Command();

const DB_URL_DEFAULTS: Record<string, string> = {
    postgresql: "postgresql://user:password@localhost:5432/mydb",
    mysql: "mysql://root:password@localhost:3306/mydb",
    sqlite: "file:./dev.db",
    mongodb: "mongodb://localhost:27017/mydb",
};

const createStarterUserModel = () => ({
    fields: {
        id: {
            type: "string",
            primary: true,
            auto: true,
        },
        email: {
            type: "string",
            required: true,
            unique: true,
        },
        password: {
            type: "string",
            required: true,
        },
        name: {
            type: "string",
            required: true,
        },
    },
    api: {
        enabled: true,
        crud: true,
        methods: ["create", "read", "update", "delete"],
    },
    options: {
        timestamps: true,
    },
});

program
    .name("zero")
    .description("Config-driven backend generator")
    .version("1.1.0");


program
    .command("init")
    .description("Create config.yaml via interactive setup")
    .option("-n, --name <filename>", "config file name", "config.yaml")
    .option("-f, --force", "overwrite existing config", false)
    .action(async (options: { name: string; force?: boolean }) => {
        try {
            const filePath = path.join(process.cwd(), options.name);

            // Check if file exists
            if (fs.existsSync(filePath) && !options.force) {
                const { overwrite } = await prompts({
                    type: "confirm",
                    name: "overwrite",
                    message: `${options.name} already exists. Overwrite?`,
                    initial: false,
                });

                if (!overwrite) {
                    console.log("❌ Operation cancelled.");
                    return;
                }
            }

            console.log("\n🚀 Zero Config Setup\n");

            // Ask questions
            const answers = await prompts([
                {
                    type: "text",
                    name: "appName",
                    message: "App name:",
                    initial: "my-app",
                },
                {
                    type: "number",
                    name: "port",
                    message: "Port:",
                    initial: 3000,
                    validate: (value: number) => {
                        if (!Number.isInteger(value)) return "Port must be an integer";
                        if (value < 1 || value > 65535) return "Port must be between 1 and 65535";
                        return true;
                    },
                },
                {
                    type: "text",
                    name: "apiPrefix",
                    message: "API prefix:",
                    initial: "/api/v1",
                    validate: (value: string) => value.startsWith("/") ? true : "API prefix must start with '/'",
                },
                {
                    type: "select",
                    name: "dbProvider",
                    message: "Database provider:",
                    choices: [
                        { title: "PostgreSQL", value: "postgresql" },
                        { title: "MongoDB", value: "mongodb" },
                        { title: "MySQL", value: "mysql" },
                    ],
                },
                {
                    type: "text",
                    name: "dbUrl",
                    message: "Database URL:",
                    initial: (prev: string) => {
                        return DB_URL_DEFAULTS[prev] ?? DB_URL_DEFAULTS.postgresql;
                    },
                    validate: (value: string) => value.trim().length > 0 ? true : "Database URL cannot be empty",
                },
                {
                    type: "confirm",
                    name: "enableCrud",
                    message: "Enable CRUD generation?",
                    initial: true,
                },
                {
                    type: "confirm",
                    name: "enableAuth",
                    message: "Enable auth feature?",
                    initial: true,
                },
                {
                    type: (prev: boolean) => (prev ? "text" : null),
                    name: "userModel",
                    message: "Auth user model name:",
                    initial: "User",
                    validate: (value: string) => /^[A-Z][a-zA-Z0-9]*$/.test(value)
                        ? true
                        : "Model name must start with an uppercase letter",
                },
                {
                    type: (_, values) => (values.enableAuth ? "select" : null),
                    name: "authStrategy",
                    message: "Auth strategy:",
                    choices: [
                        { title: "JWT", value: "jwt" },
                    ],
                },
                {
                    type: (_, values) => (values.enableAuth ? "text" : null),
                    name: "jwtSecret",
                    message: "JWT secret (or env placeholder):",
                    initial: "${JWT_SECRET}",
                    validate: (value: string) => value.trim().length > 0 ? true : "JWT secret cannot be empty",
                },
                {
                    type: "confirm",
                    name: "includeSampleUserModel",
                    message: "Include a sample User model?",
                    initial: true,
                },
                {
                    type: "confirm",
                    name: "enableCors",
                    message: "Enable CORS?",
                    initial: true,
                },
                {
                    type: (prev: boolean) => (prev ? "text" : null),
                    name: "corsOrigin",
                    message: "CORS origin:",
                    initial: "*",
                },
            ]);

            // Handle cancel (Ctrl+C)
            if (!answers.appName) {
                console.log("❌ Setup cancelled.");
                return;
            }

            const userModelName = answers.userModel || "User";

            const configData: Record<string, unknown> = {
                app: {
                    name: answers.appName,
                    port: answers.port,
                },
                server: {
                    apiPrefix: answers.apiPrefix,
                },
                database: {
                    provider: answers.dbProvider,
                    url: answers.dbUrl,
                },
                models: answers.includeSampleUserModel
                    ? {
                        [userModelName]: createStarterUserModel(),
                    }
                    : {},
                features: {
                    crud: {
                        enabled: answers.enableCrud,
                    },
                    auth: {
                        enabled: answers.enableAuth,
                        strategy: answers.enableAuth ? answers.authStrategy : undefined,
                        userModel: answers.enableAuth ? userModelName : undefined,
                    },
                },
                output: {
                    paths: {
                        controllers: "controllers",
                        models: "models",
                        routes: "routes",
                        middleware: "middleware",
                        services: "services"
                    }
                },
                security: {
                    hash: "bcrypt",
                    jwtSecret: answers.enableAuth ? answers.jwtSecret : "${JWT_SECRET}",
                    cors: {
                        enabled: answers.enableCors,
                        origin: answers.enableCors ? (answers.corsOrigin || "*") : "",
                    },
                },
                env: {
                    development: {
                        debug: true,
                    },
                    production: {
                        debug: false,
                    },
                },
            };

            const yamlContent = `# Zero Config File\n${yaml.dump(configData, { noRefs: true, lineWidth: 120 })}`;

            // Write file
            fs.writeFileSync(filePath, yamlContent, "utf-8");

            const validation = validateYaml(filePath);
            if (!validation.valid) {
                console.error("\n⚠️ Config was created but validation reported issues:");
                validation.errors.forEach((err) => console.error(`  • ${err}`));
            }

            console.log("\n✅ Config created successfully!");
            console.log(`📄 Location: ${filePath}`);

            console.log("\n👉 Next step:");
            console.log(`   zero generate -c ${options.name}\n`);
        } catch (error) {
            console.error("❌ Error during setup:");
            console.error(error);
            process.exit(1);
        }
    });

program
    .command("generate")
    .description("Generate backend from config file")
    .option("-c, --config <path>", "path to config file", "config.yaml")
    .option("-r, --resume", "resume from last successful step", false)
    .option("-f, --fresh", "start from scratch, ignoring previous progress", false)
    .action((options: GenerateOptions) => {
        try {
            const filePath = options.config;

            if (!fs.existsSync(filePath)) {
                console.error("File not found:", filePath);
                process.exit(1);
            }

            BASE_PATH = process.cwd();

            // Compute hash for change detection
            const configContent = fs.readFileSync(filePath, "utf-8");
            const configHash = crypto.createHash("md5").update(configContent).digest("hex");

            console.log("File Valiation Starts ...");
            const result = validateYaml(filePath);
            console.log(result.summary);

            if (!result.valid) {
                result.errors.forEach((err) => console.error(`  • ${err}`));
                process.exit(1);
            }

            if (result.valid && result.config != null) {
                console.log("Zero-Engine Starts ...");
                zeroEngine(result.config, {
                    resume: (options.resume ?? false) && !(options.fresh ?? false),
                    fresh: options.fresh ?? false,
                    configHash: configHash
                });
            }
        } catch (error) {
            console.error(error);
        }
    });

program
    .command("run")
    .description("Run backend in development mode from output base folder")
    .action(() => {
        try {
            const runPath = path.join(BASE_PATH || process.cwd(), "server");

            if (!fs.existsSync(runPath)) {
                console.error(`❌ Output base folder not found: ${runPath}`);
                console.error("👉 Run generation first: zero generate -c <config file path>");
                process.exit(1);
            }

            console.log(`🚀 Running dev server in: ${runPath}`);
            execSync("npm run dev", {
                cwd: runPath,
                stdio:"inherit"
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("❌ Failed to run development server:", error);
            process.exit(1);
        }
    });


program
    .command("drop")
    .description("Drop generated output folder created by Zero engine")
    .option("-f, --force", "delete without confirmation", false)
    .action(async (options: { force?: boolean }) => {
        try {
            const currentDir = process.cwd();
            const outputPath = path.join(currentDir, "server");

            if (!fs.existsSync(outputPath)) {
                console.log("ℹ️ Nothing to drop. Output folder was not found.");
                return;
            }

            if (!options.force) {
                const { confirmDrop } = await prompts({
                    type: "confirm",
                    name: "confirmDrop",
                    message: `Delete output folder?\n  - folder: ${outputPath}`,
                    initial: false,
                });

                if (!confirmDrop) {
                    console.log("❌ Drop cancelled.");
                    return;
                }
            }

            fs.rmSync(outputPath, { recursive: true, force: true });
            fs.rmSync(path.join(currentDir, '.zero-progress.json'), { force: true });
            console.log(`🗑️ Removed: ${outputPath}`);

            console.log("✅ Output folder dropped successfully.");
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("❌ Failed to drop output folder:", message);
            process.exit(1);
        }
    });

program.parse();