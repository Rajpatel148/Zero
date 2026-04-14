import path from "path";
import { BASE_PATH } from "../../bin/zero.js";
import { starterGenerator } from "../generators/Starter.generator.js";
import { AppConfig, AuthFeatureSchema } from "../lib/types.js";
import { folderGenerator } from "../lib/utilityFunctions/folder.helper.js";
import { crudGenerator } from "../generators/CRUD.generator.js";
import { authGenerator } from "../generators/auth.generator.js";
import { isStepCompleted, saveStep, updateConfigHash, resetProgress } from "../lib/utilityFunctions/progress.helper.js";

export let OUTPUT_PATH: string;

export interface EngineOptions {
     resume: boolean;
     fresh: boolean;
     configHash: string;
}

export const zeroEngine = async (config: AppConfig, options: EngineOptions) => {
     let processFlag = true;

     // Initialize progress tracking
     if (options.fresh) {
          resetProgress();
     }
     updateConfigHash(options.configHash);

     //create the output folder with name of the project name 
     folderGenerator("server", BASE_PATH);

     OUTPUT_PATH = path.join(BASE_PATH, "server");

     // Step 1: Starter / Prisma
     if (!options.resume || !isStepCompleted("prisma")) {
          console.log("➡️ Executing Step: prisma");
          processFlag = await starterGenerator({
               config: config
          });
          if (!processFlag) throw new Error("Something failed in starter generation");
          saveStep("prisma");
     } else {
          console.log("⏭️ Skipping Step: prisma (already completed)");
     }

     // Step 2: CRUD
     if (config.features?.crud?.enabled == true) {
          // Note: crudGenerator now handles its own internal resume logic per model
          processFlag = await crudGenerator(config, options.resume);
          if (!processFlag) throw new Error("Something failed in CRUD generation");
     }

     // Step 3: Auth
     const authFeature = config.features?.auth as AuthFeatureSchema | undefined;
     if (authFeature?.enabled === true) {
          if (!options.resume || !isStepCompleted("auth")) {
               console.log("➡️ Executing Step: auth");
               processFlag = await authGenerator(config);
               if (!processFlag) throw new Error("Something failed in auth generation");
               saveStep("auth");
          } else {
               console.log("⏭️ Skipping Step: auth (already completed)");
          }
     }

     console.log("\n🚀 Zero Engine completed successfully!");
     console.log(`   Output: ${OUTPUT_PATH}`);
}