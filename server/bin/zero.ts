#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs";
import crypto from "crypto";
import { validateYaml } from "../src/validator/index.js";
import { zeroEngine } from "../src/engine/index.js";

export let BASE_PATH: string;
type GenerateOptions = {
    config: string;
    resume?: boolean;
    fresh?: boolean;
};

const program = new Command();

program
    .name("zero")
    .description("Config-driven backend generator")
    .version("0.1.0");

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

program.parse();