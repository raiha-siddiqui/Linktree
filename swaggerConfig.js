//  this file runs once at server startup and build the final documentation object which store in memory
import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Profile API",
      version: "1.0.0",
      description: "Profile Api endpoints where user get or update profile",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/docs/*.yaml"],
};
// This function performs the "Build Once" step:
// 1. Reads profile.yaml
// 2. Reads component.yaml (and any others)
// 3. Parses them from text into objects.
// 4. Merges them into ONE giant specification object.
const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
