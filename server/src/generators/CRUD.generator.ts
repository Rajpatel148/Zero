import { AppConfig } from "../lib/types.js";
import path from "path";
import { fileURLToPath } from "url";
import { generateFromTemplate } from "../lib/utilityFunctions/codeGeneratorFromTemplate.js";
import { folderGenerator } from "../lib/utilityFunctions/folder.helper.js";
import { OUTPUT_PATH } from "../engine/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const crudGenerator = async (config: AppConfig): Promise<boolean> => {
     try {

          if (!config.models) {
               return false;
          }

          const srcPath = path.join(OUTPUT_PATH, "src");

          // Create necessary folders
          folderGenerator(config.output.paths.routes, srcPath);
          folderGenerator(config.output.paths.controllers, srcPath);

          // 1. Generate the main routes index.ts file
          const routeIndexPath = path.join(srcPath, "routes", "index.ts");
          await generateFromTemplate({
               templatePath: path.resolve(__dirname, "../templates/routes/index.ts.hbs"),
               outputPath: routeIndexPath,
               context: config
          });

          for (const modelName of Object.keys(config.models)) {
               const modelData = config.models[modelName];

               // Default API config
               const apiConfig = (modelData as any).api || {
                    enabled: true,
                    crud: true,
                    methods: ["create", "read", "update", "delete"]
               };

               // Skip completely if API disabled
               if (!apiConfig.enabled) {
                    continue;
               }

               const context = {
                    name: modelName,
                    ...modelData,
                    api: apiConfig
               };

               //  Generate Controller ONLY if needed
               if (apiConfig.crud || (apiConfig.methods && apiConfig.methods.length > 0)) {
                    const controllerPath = path.join(
                         srcPath,
                         "controllers",
                         `${modelName.toLowerCase()}.controller.ts`
                    );

                    await generateFromTemplate({
                         templatePath: path.resolve(
                              __dirname,
                              "../templates/controllers/resourceController.ts.hbs"
                         ),
                         outputPath: controllerPath,
                         context: context
                    });
               }

               //  Generate Router ONLY if needed
               if (apiConfig.crud || (apiConfig.methods && apiConfig.methods.length > 0)) {
                    const routerPath = path.join(
                         srcPath,
                         "routes",
                         `${modelName}.route.ts`
                    );

                    await generateFromTemplate({
                         templatePath: path.resolve(
                              __dirname,
                              "../templates/routes/helperRouter.ts.hbs"
                         ),
                         outputPath: routerPath,
                         context: context
                    });
               }
          }
          return true;
     } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const errorStack = error instanceof Error ? error.stack : '';

          console.error("\n❌ Error generating CRUD APIs code:");
          console.error(`   ${errorMessage}`);
          if (errorStack) {
               console.error(`\n   Stack: ${errorStack}`);
          }
          return false;
     }
}