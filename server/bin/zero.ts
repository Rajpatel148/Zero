#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs";
import { validateYaml } from "../src/validator/index.js";
import { zeroEngine } from "../src/engine/index.js";

export let BASE_PATH: string;
type GenerateOptions = {
    config: string;
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
    .action((options: GenerateOptions) => {
        try {
            const filePath = options.config;

            if (!fs.existsSync(filePath)) {
                console.error("File not found:", filePath);
                process.exit(1);
            }

            BASE_PATH = process.cwd();

            console.log("File Valiation Starts ...");
            const result = validateYaml(filePath);
            console.log(result.summary);

            if (!result.valid) {
                result.errors.forEach((err) => console.error(`  • ${err}`));
                process.exit(1);
            }

            if (result.valid && result.config != null) {
                console.log("Zero-Engine Starts ...");
                zeroEngine(result.config);
            }
        } catch (error) {
            console.error(error);
        }
    });

program.parse();