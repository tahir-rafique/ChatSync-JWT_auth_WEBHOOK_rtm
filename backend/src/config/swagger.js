const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ChatApp API",
      version: "1.0.0",
      description: "Real-time Chat Application REST API with WebSocket support",
      contact: { name: "ChatApp Team", email: "support@chatapp.com" },
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 5000}/api/v1`, description: "Development" },
      { url: "https://api.chatapp.com/api/v1", description: "Production" },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            avatar: { type: "string" },
            isOnline: { type: "boolean" },
            lastSeen: { type: "string", format: "date-time" },
          },
        },
        Message: {
          type: "object",
          properties: {
            _id: { type: "string" },
            conversationId: { type: "string" },
            sender: { $ref: "#/components/schemas/User" },
            content: { type: "string" },
            type: { type: "string", enum: ["text", "image", "video", "audio", "file"] },
            fileUrl: { type: "string" },
            readBy: { type: "array", items: { type: "string" } },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errors: { type: "array", items: { type: "object" } },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ["./src/api/v1/routes/*.js", "./src/api/v1/controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
