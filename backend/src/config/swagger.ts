import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ReferralHub API',
      version: '1.0.0',
      description: 'A comprehensive referral system API with user authentication, referral tracking, and credit management',
      contact: {
        name: 'ReferralHub Team',
        email: 'support@referralhub.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token',
          description: 'JWT token stored in HTTP-only cookie',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User unique identifier',
              example: '507f1f77bcf86cd799439011',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com',
            },
            referralCode: {
              type: 'string',
              description: 'Unique referral code for the user',
              example: 'abc123def',
            },
            credits: {
              type: 'number',
              description: 'User credit balance',
              example: 10,
            },
          },
        },
        DashboardStats: {
          type: 'object',
          properties: {
            totalReferred: {
              type: 'number',
              description: 'Total number of users referred',
              example: 5,
            },
            convertedCount: {
              type: 'number',
              description: 'Number of referred users who made a purchase',
              example: 3,
            },
            totalCredits: {
              type: 'number',
              description: 'Total credits earned',
              example: 12,
            },
            referralLink: {
              type: 'string',
              description: 'User referral link',
              example: 'http://localhost:3001/signup?ref=abc123def',
            },
          },
        },
        Purchase: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Purchase unique identifier',
              example: '507f1f77bcf86cd799439012',
            },
            userId: {
              type: 'string',
              description: 'User who made the purchase',
              example: '507f1f77bcf86cd799439011',
            },
            amount: {
              type: 'number',
              description: 'Purchase amount',
              example: 10,
            },
            isFirst: {
              type: 'boolean',
              description: 'Whether this is the user first purchase',
              example: true,
            },
          },
        },
        Referral: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Referral unique identifier',
              example: '507f1f77bcf86cd799439013',
            },
            referrerId: {
              type: 'string',
              description: 'User who made the referral',
              example: '507f1f77bcf86cd799439011',
            },
            referredUserId: {
              type: 'string',
              description: 'User who was referred',
              example: '507f1f77bcf86cd799439014',
            },
            referralCode: {
              type: 'string',
              description: 'Referral code used',
              example: 'abc123def',
            },
            status: {
              type: 'string',
              enum: ['pending', 'converted'],
              description: 'Referral status',
              example: 'converted',
            },
            credited: {
              type: 'boolean',
              description: 'Whether credits have been awarded',
              example: true,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Invalid credentials',
            },
          },
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);