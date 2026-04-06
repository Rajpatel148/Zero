import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import { fileSchema } from "./schema.js";
import { AppConfig, ValidateOptions, ValidationResult } from "../lib/types.js";
import _Ajv, { ErrorObject } from "ajv";
const Ajv = _Ajv.default ?? _Ajv;

const ajv = new Ajv({
     allErrors: true,
     strict: true,
     allowUnionTypes: true,
     verbose: true,
});

const validateSchema = ajv.compile(fileSchema);

// ── Main function ─────────────────────────────────────────────────────────────

function validateYaml(
     filePath: string,
     { strict = false }: ValidateOptions = {}
): ValidationResult {
     const resolved = path.resolve(filePath);

     // 2. Extension guard
     const ext = path.extname(resolved).toLowerCase();
     if (ext !== ".yaml" && ext !== ".yml") {
          const result = buildErrorResult(
               `Unsupported extension "${ext}" — expected .yaml or .yml`
          );
          if (strict) throw new Error(result.errors[0]);
          return result;
     }

     // 3. Read file
     let raw: string;
     try {
          raw = fs.readFileSync(resolved, "utf-8");
     } catch (err) {
          const result = buildErrorResult(
               `Could not read file: ${(err as NodeJS.ErrnoException).message}`
          );
          if (strict) throw new Error(result.errors[0]);
          return result;
     }

     // 4. Parse YAML
     let parsed: unknown;
     try {
          parsed = yaml.load(raw);
     } catch (err) {
          const result = buildErrorResult(
               `YAML parse error: ${(err as yaml.YAMLException).message}`
          );
          if (strict) throw new Error(result.errors[0]);
          return result;
     }

     // 5. Validate against schema
     const valid = validateSchema(parsed);

     if (!valid) {
          const errors = formatErrors(validateSchema.errors ?? []);
          if (strict) {
               throw new Error(
                    `Validation failed:\n${errors.map((e) => `  • ${e}`).join("\n")}`
               );
          }
          return buildResult(false, null, errors);
     }

     return buildResult(true, parsed as AppConfig, []);
}

function formatErrors(errors: ErrorObject[]): string[] {
     return errors.map((err) => {
          const location = err.instancePath
               ? err.instancePath.replace(/^\//, "").replace(/\//g, ".")
               : "root";

          switch (err.keyword) {
               case "required":
                    return `[${location}] Missing required field: "${err.params.missingProperty}"`;

               case "additionalProperties":
                    return `[${location}] Unknown field not allowed: "${err.params.additionalProperty}"`;

               case "type":
                    return `[${location}] Wrong type — expected ${err.params.type}, got ${typeof (err as ErrorObject & { data?: unknown }).data}`;

               case "enum":
                    return `[${location}] Invalid value — allowed: ${(err.params.allowedValues as string[]).join(", ")}`;

               case "minimum":
               case "maximum":
                    return `[${location}] Value out of range: ${err.message}`;

               default:
                    return `[${location}] ${err.message ?? "Unknown error"}`;
          }
     });
}

// ── Result builder ────────────────────────────────────────────────────────────

function buildResult(
     valid: boolean,
     config: AppConfig | null,
     errors: string[]
): ValidationResult {
     return {
          valid,
          config,
          errors,
          summary: valid
               ? "✅ File validation completed successfully!"
               : `❌ Found ${errors.length} error${errors.length !== 1 ? "s" : ""}.`,
     };
}

function buildErrorResult(message: string): ValidationResult {
     return buildResult(false, null, [message]);
}


export { validateYaml, fileSchema };
export type { AppConfig, ValidationResult, ValidateOptions };