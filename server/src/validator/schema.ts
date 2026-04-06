export const fileSchema = {
     type: "object",
     properties: {
          app: {
               type: "object",
               properties: {
                    name: { type: "string" },
                    port: { type: "integer" },
               },
               required: ["name", "port"],
               additionalProperties: false,
          },
          database: {
               type: "object",
               properties: {
                    type: { type: "string" },
                    url: { type: "string" },
               },
               required: ["type", "url"],
               additionalProperties: false,
          },
          api: {
               type: "object",
               properties: {
                    prefix: { type: "string" },
               },
               required: ["prefix"],
          },
          models: {
               type: "object",
               patternProperties: {
                    ".*": {
                         type: "object",
                         properties: {
                              fields: {
                                   type: "object",
                                   patternProperties: {
                                        ".*": {
                                             type: "object",
                                             properties: {
                                                  type: { type: "string" },
                                                  required: { type: "boolean" },
                                                  unique: { type: "boolean" },
                                                  primary: { type: "boolean" },
                                                  values: { type: "array", items: { type: "string" } },
                                                  default: {},
                                             },
                                             required: ["type"],
                                             additionalProperties: true,
                                        },
                                   },
                              },
                              timestamps: { type: "boolean" },
                              relations: {
                                   type: "object",
                                   patternProperties: {
                                        ".*": {
                                             type: "object",
                                             properties: {
                                                  type: { type: "string" },
                                                  target: { type: "string" },
                                             },
                                             required: ["type", "target"],
                                        },
                                   },
                              },
                         },
                         required: ["fields"],
                    },
               },
          },
          features: {
               type: "object",
               additionalProperties: {
                    type: "object",
                    properties: {
                         enabled: { type: "boolean" },
                    },
                    required: ["enabled"],
               },
          },
          plugins: {
               type: "array",
               items: {
                    type: "object",
                    properties: {
                         name: { type: "string" },
                         enabled: { type: "boolean" },
                         config: { type: "object" },
                    },
                    required: ["name", "enabled"],
               },
          },
          output: {
               type: "object",
               properties: {
                    structure: { type: "string" },
                    language: { type: "string" },
                    framework: { type: "string" },
                    folders: { type: "object" },
               },
               required: ["structure", "language", "framework", "folders"],
          },
     },
     // required: ["app", "database", "api", "models", "features", "plugins", "output"],
     required: ["app", "database", "api"],
} as const;