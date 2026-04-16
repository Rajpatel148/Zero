import { AppConfig, AuthFeatureSchema, CrudFeatureSchema } from "../lib/types.js";
import path from "path";
import { fileURLToPath } from "url";
import { generateFromTemplate } from "../lib/utilityFunctions/codeGeneratorFromTemplate.js";
import { folderGenerator } from "../lib/utilityFunctions/folder.helper.js";
import { OUTPUT_PATH } from "../engine/index.js";
import { isStepCompleted, saveStep } from "../lib/utilityFunctions/progress.helper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const crudGenerator = async (config: AppConfig, resume: boolean = false): Promise<boolean> => {
     try {

          if (!config.models) {
               return false;
          }

          const srcPath = path.join(OUTPUT_PATH, "src");

          // Create necessary folders
          folderGenerator(config.output.paths.routes, srcPath);
          folderGenerator(config.output.paths.controllers, srcPath);
          folderGenerator(config.output.paths.middleware, srcPath);
          folderGenerator("utils", srcPath);

          // Check if auth is enabled for route index generation
          const authFeature = config.features?.auth as AuthFeatureSchema | undefined;
          const authEnabled = authFeature?.enabled === true;

          // Check if pagination is enabled in config.features.crud
          const crudFeature = config.features?.crud as CrudFeatureSchema | undefined;
          const paginationEnabled = crudFeature?.pagination?.enabled === true;
          const pageLimit = crudFeature?.pagination?.pageLimit ?? 10;

          // Generate pagination utility when the feature is enabled
          if (paginationEnabled) {
               const paginationUtilPath = path.join(srcPath, "utils", "pagination.ts");
               await generateFromTemplate({
                    templatePath: path.resolve(__dirname, "../templates/utils/pagination.ts.hbs"),
                    outputPath: paginationUtilPath,
                    context: { pageLimit },
               });
               console.log("✅ Pagination utility generated");
          }

          // 1. Generate the main routes index.ts file
          const routeIndexPath = path.join(srcPath, "routes", "index.ts");
          await generateFromTemplate({
               templatePath: path.resolve(__dirname, "../templates/routes/index.ts.hbs"),
               outputPath: routeIndexPath,
               context: { ...config, authEnabled }
          });

          for (const modelName of Object.keys(config.models)) {
               const stepName = `crud:${modelName}`;
               if (resume && isStepCompleted(stepName)) {
                    console.log(`⏭️ Skipping Model: ${modelName} (already generated)`);
                    continue;
               }

               console.log(`➡️ Generating CRUD for Model: ${modelName}`);
               const modelData = config.models[modelName];

               // Default API config — if model.api is missing, assume enabled + crud
               const apiConfig = modelData.api || {
                    enabled: true,
                    crud: true,
               };

               // Skip completely if API disabled
               if (apiConfig.enabled === false) {
                    continue;
               }

               // Build validation fields (non-primary fields with required/enum)
               const validationFields: Record<string, any> = {};
               if (modelData.fields) {
                    for (const [fieldName, fieldDef] of Object.entries(modelData.fields)) {
                         if (fieldDef.primary) continue; // Skip primary key
                         if (fieldDef.required || fieldDef.enum) {
                              validationFields[fieldName] = {
                                   required: fieldDef.required || false,
                                   enum: fieldDef.enum || null,
                              };
                         }
                    }
               }

               const context = {
                    name: modelName,
                    ...modelData,
                    api: apiConfig,
                    validationFields: Object.keys(validationFields).length > 0 ? validationFields : null,
                    paginationEnabled,
                    pageLimit,
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

               // Mark model as completed
               saveStep(stepName);
          }

          console.log("✅ CRUD modules generated successfully");
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