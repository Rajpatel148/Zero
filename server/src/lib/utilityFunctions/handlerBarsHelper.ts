import Handlebars from 'handlebars';

/**
 * Map JSON schema types to Prisma types
 */
Handlebars.registerHelper('mapType', (type: string) => {
     const typeMap: Record<string, string> = {
          string: 'String',
          number: 'Float',
          integer: 'Int',
          bigint: 'BigInt',
          boolean: 'Boolean',
          date: 'DateTime',
          datetime: 'DateTime',
          uuid: 'String',
          json: 'Json',
          bytes: 'Bytes',
          decimal: 'Decimal',

          // Prisma pass-through
          String: 'String',
          Int: 'Int',
          BigInt: 'BigInt',
          Float: 'Float',
          Decimal: 'Decimal',
          Boolean: 'Boolean',
          DateTime: 'DateTime',
          Json: 'Json',
          Bytes: 'Bytes',
     };

     return typeMap[type] || type;
});

/** Type checks */
Handlebars.registerHelper('isString', (value: unknown) => typeof value === 'string');
Handlebars.registerHelper('isNumber', (value: unknown) => typeof value === 'number');
Handlebars.registerHelper('isBoolean', (value: unknown) => typeof value === 'boolean');
Handlebars.registerHelper('isObject', (value: unknown) =>
     typeof value === 'object' && value !== null && !Array.isArray(value)
);

/** Join helpers */
Handlebars.registerHelper('join', (array: unknown[], separator: string) => {
     if (!Array.isArray(array)) return '';
     return array.map((item) => `"${item}"`).join(separator || ', ');
});

Handlebars.registerHelper('joinFields', (array: string[]) => {
     if (!Array.isArray(array)) return '';
     return array.join(', ');
});

/** Field check */
Handlebars.registerHelper('hasField', (fields: Record<string, any>, fieldName: string) => {
     if (!fields || typeof fields !== 'object') return false;
     return fieldName in fields;
});

/** Logical helpers */
Handlebars.registerHelper('or', (...args: any[]) => {
     args.pop();
     return args.some(Boolean);
});

Handlebars.registerHelper('and', (...args: any[]) => {
     args.pop();
     return args.every(Boolean);
});

Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
Handlebars.registerHelper('ne', (a: any, b: any) => a !== b);
Handlebars.registerHelper('gt', (a: number, b: number) => a > b);
Handlebars.registerHelper('lt', (a: number, b: number) => a < b);
Handlebars.registerHelper('not', (value: any) => !value);

/** Collect enums */
Handlebars.registerHelper('collectEnums', (models: Record<string, any>) => {
     const enums: Record<string, any> = {};

     for (const [modelName, model] of Object.entries(models)) {
          if (model.fields) {
               for (const [fieldName, field] of Object.entries<any>(model.fields)) {
                    if (field.enum) {
                         const enumName =
                              field.enumName ||
                              `${modelName}${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`;

                         enums[enumName] = {
                              name: enumName,
                              values: field.enum,
                         };
                    }
               }
          }
     }

     return Object.values(enums);
});

/** Format default */
Handlebars.registerHelper('formatDefault', (defaultValue: any, type: string) => {
     if (defaultValue === undefined || defaultValue === null) return '';

     const prismaFunctions = ['now()', 'uuid()', 'cuid()', 'autoincrement()'];
     if (prismaFunctions.includes(defaultValue)) {
          return `@default(${defaultValue})`;
     }

     switch (type) {
          case 'String':
               return `@default("${defaultValue}")`;
          case 'Int':
          case 'BigInt':
          case 'Float':
          case 'Decimal':
               return `@default(${defaultValue})`;
          case 'Boolean':
               return `@default(${defaultValue})`;
          case 'DateTime':
               if (defaultValue === 'now') return '@default(now())';
               return `@default("${defaultValue}")`;
          default:
               return `@default(${defaultValue})`;
     }
});

Handlebars.registerHelper("lowercase", function (str) {
     return str.toLowerCase();
});

Handlebars.registerHelper("pascalCase", (str) => {
     return str.charAt(0).toUpperCase() + str.slice(1);
});

Handlebars.registerHelper("camelCase", (str: string) => {
     return str.charAt(0).toLowerCase() + str.slice(1);
});

Handlebars.registerHelper("includes", (array: unknown[], value: unknown) => {
     if (!Array.isArray(array)) return false;
     return array.includes(value);
});

Handlebars.registerHelper("json", (context: unknown) => {
     return JSON.stringify(context);
});

export default Handlebars;