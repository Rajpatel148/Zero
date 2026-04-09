export const tsconfigTemplate = (): string => {
     const config = {
          compilerOptions: {
               target: "ES6",
               module: "commonjs",
               types:["node"],
               outDir: "./dist",
               rootDir: ".",
               strict: true,
               esModuleInterop: true,
               allowSyntheticDefaultImports: true,
               sourceMap: true,
          },
          include: ["src/**/*.ts","prisma.config.ts"],
          exclude: ["node_modules", "dist"],
     };

     return JSON.stringify(config, null, 2);
};
