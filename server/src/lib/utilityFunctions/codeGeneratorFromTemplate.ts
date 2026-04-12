import fs from 'fs';
import path from 'path';
import Handlebars from './handlerBarsHelper.js';
import prettier from 'prettier';

type TemplateGeneratorOptions<T> = {
     templatePath: string;
     outputPath: string;
     context?: T;
};

export const generateFromTemplate = <T>({
     templatePath,
     outputPath,
     context,
}: TemplateGeneratorOptions<T>) => {
     (async () =>{
          // Read template
          const templateContent = fs.readFileSync(templatePath, 'utf-8');

          // Compile template
          const template = Handlebars.compile(templateContent);

          // Render template
          const renderedCode = template(context);

          // Ensure directory exists
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });

          // Detect file type → choose parser
          const ext = path.extname(outputPath);
          if (ext === '.prisma') {
               fs.writeFileSync(outputPath, renderedCode);
               return;
          }
          let parser: prettier.BuiltInParserName = 'babel';

          if (ext === '.ts') parser = 'typescript';
          else if (ext === '.json') parser = 'json';
          else if (ext === '.yaml' || ext === '.yml') parser = 'yaml';

          // Format using Prettier
          const formattedCode = await prettier.format(renderedCode, {
               parser,
          });

          // Write file
          fs.writeFileSync(outputPath, formattedCode);
     })().catch(err => {
          console.error('❌ Template generation failed');
          throw err;
     });
};