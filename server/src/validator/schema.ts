export const fileSchema = {
     type: "object",
     properties: {
          app: {
               type: "object",
               properties: {
                    name: { type: "string" },
                    port: { type: "integer" },
                    // v: { type: "string", enum: ["development", "production", "test"] },
               },
               required: ["name", "port"],
               additionalProperties: false,
          },

          server: {
               type: "object",
               properties: {
                    apiPrefix: { type: "string" },
                    // framework: { type: "string", default: "express" },
               },
               additionalProperties: false,
          },

          database: {
               type: "object",
               properties: {
                    provider: { type: "string" },
                    url: { type: "string" },
               },
               required: ["provider", "url"],
               additionalProperties: false,
          },

          models: {
               type: "object",
               patternProperties: {
                    "^[A-Z][a-zA-Z0-9]*$": {
                         type: "object",
                         properties: {
                              table: { type: "string" },

                              fields: {
                                   type: "object",
                                   patternProperties: {
                                        "^[a-zA-Z][a-zA-Z0-9]*$": {
                                             type: "object",
                                             properties: {
                                                  type: { type: "string" },
                                                  required: { type: "boolean" },
                                                  unique: { type: "boolean" },
                                                  primary: { type: "boolean" },
                                                  default: {},
                                                  enum: {
                                                       type: "array",
                                                       items: { type: "string" },
                                                  },
                                                  auto: { type: "boolean" },
                                             },
                                             required: ["type"],
                                             additionalProperties: true,
                                        },
                                   },
                                   additionalProperties: false,
                              },

                              api: {
                                   type: "object",
                                   properties: {
                                        enabled: { type: "boolean" },
                                        crud: { type: "boolean" },
                                        methods: {
                                             type: "array",
                                             items: {
                                                  type: "string",
                                                  enum: ["create", "read", "update", "delete"],
                                             },
                                        },
                                   },
                                   required: ["enabled"],
                                   additionalProperties: false,
                              },

                              options: {
                                   type: "object",
                                   properties: {
                                        timestamps: { type: "boolean" },
                                        softDelete: { type: "boolean" },
                                   },
                                   additionalProperties: true,
                              },

                              relations: {
                                   type: "object",
                                   patternProperties: {
                                        "^[a-zA-Z][a-zA-Z0-9]*$": {
                                             type: "object",
                                             properties: {
                                                  type: {
                                                       type: "string",
                                                       enum: [
                                                            "one-to-one",
                                                            "one-to-many",
                                                            "many-to-one",
                                                            "many-to-many",
                                                       ],
                                                  },
                                                  target: { type: "string" },
                                                  foreignKey: { type: "string" },
                                             },
                                             required: ["type", "target"],
                                             additionalProperties: false,
                                        },
                                   },
                              },
                         },
                         required: ["fields"],
                         additionalProperties: false,
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
                    additionalProperties: true, // allow feature-specific configs
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
                    additionalProperties: true, // plugin extensibility
               },
          },

          output: {
               type: "object",
               properties: {
                    // structure: { type: "string" },
                    // language: { type: "string", default: "javascript" },
                    // framework: { type: "string" },

                    paths: {
                         type: "object",
                         properties: {
                              base: { type: "string" },
                              controllers: { type: "string" },
                              models: { type: "string" },
                              routes: { type: "string" },
                              middleware: { type: "string" },
                              services: { type: "string" },
                         },
                         additionalProperties: true,
                    },
               },
               required: ["paths"],
               additionalProperties: false,
          },

          security: {
               type: "object",
               properties: {
                    hash: { type: "string" },
                    jwtSecret: { type: "string" },
                    cors: {
                         type: "object",
                         properties: {
                              enabled: { type: "boolean" },
                         },
                         additionalProperties: true,
                    },
               },
               additionalProperties: true,
          },

          naming: {
               type: "object",
               properties: {
                    case: { type: "string" },
                    fileCase: { type: "string" },
               },
               additionalProperties: false,
          },

          env: {
               type: "object",
               additionalProperties: {
                    type: "object",
                    additionalProperties: true,
               },
          },
     },

     required: ["app", "database", "models", "output"],

     additionalProperties: false,
} as const;