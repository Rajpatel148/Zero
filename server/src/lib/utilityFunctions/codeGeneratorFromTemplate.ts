import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

type TemplateGeneratorOptions<T> = {
     templatePath: string;   
     outputPath: string;     
     context: T;             
};

export const generateFromTemplate = <T>({
     templatePath,
     outputPath,
     context,
}: TemplateGeneratorOptions<T>) => {
     try {
          // Read template file
          const templateContent = fs.readFileSync(templatePath, 'utf-8');

          // Compile template
          const template = Handlebars.compile(templateContent);

          //  Render template with context
          const renderedCode = template(context);

          //  Ensure folder exists
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });

          // Save rendered content to outputPath
          fs.writeFileSync(outputPath, renderedCode);
     } catch (error) {
          console.error('❌ Template generation failed ');
          throw error
     }
};