import { AppConfig, AuthFeatureSchema } from "../lib/types.js";
import path from "path";
import { fileURLToPath } from "url";
import { generateFromTemplate } from "../lib/utilityFunctions/codeGeneratorFromTemplate.js";
import { OUTPUT_PATH } from "../engine/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const authGenerator = async (config: AppConfig): Promise<boolean> => {
     try {
          const authFeature = config.features?.auth as AuthFeatureSchema | undefined;

          if (!authFeature?.enabled) {
               return true; // Not enabled, skip silently
          }

          const userModel = authFeature.userModel || "User";
          const jwtSecret = config.security?.jwtSecret || "your-secret-key";

          const srcPath = path.join(OUTPUT_PATH, "src");

          const context = {
               userModel,
               jwtSecret,
               ...config,
          };

          // Generate auth controller
          const controllerPath = path.join(srcPath, `${config.output.paths.controllers || "controllers"}`, "auth.controller.ts");
          await generateFromTemplate({
               templatePath: path.resolve(__dirname, "../templates/auth/auth.controller.ts.hbs"),
               outputPath: controllerPath,
               context,
          });

          // Generate auth routes
          const routesPath = path.join(srcPath, `${config.output.paths.routes || "routes"}`, "auth.route.ts");
          await generateFromTemplate({
               templatePath: path.resolve(__dirname, "../templates/auth/auth.routes.ts.hbs"),
               outputPath: routesPath,
               context,
          });

          // Generate auth middleware
          const middlewarePath = path.join(srcPath, `${config.output.paths.middleware || "middleware"}`, "auth.middleware.ts");
          await generateFromTemplate({
               templatePath: path.resolve(__dirname, "../templates/auth/auth.middleware.ts.hbs"),
               outputPath: middlewarePath,
               context,
          });

          console.log("✅ Auth module generated successfully");
          return true;
     } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const errorStack = error instanceof Error ? error.stack : '';

          console.error("\n❌ Error generating auth module:");
          console.error(`   ${errorMessage}`);
          if (errorStack) {
               console.error(`\n   Stack: ${errorStack}`);
          }
          return false;
     }
};
