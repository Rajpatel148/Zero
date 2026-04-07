export const tsconfigTemplate = (): string => {
     const config = {
          compilerOptions: {
               target: "ES2020",
               module: "NodeNext",
               moduleResolution: "NodeNext",
               lib: ["ES2020"],
               types:["node"],
               outDir: "./dist",
               rootDir: ".",
               strict: true,
               esModuleInterop: true,
               resolveJsonModule: true,
               skipLibCheck: true,
               forceConsistentCasingInFileNames: true,
               sourceMap: true,
               declaration: true,
          },
          include: ["src/**/*.ts"],
          exclude: ["node_modules", "dist"],
     };

     return JSON.stringify(config, null, 2);
};
