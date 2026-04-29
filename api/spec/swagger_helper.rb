# frozen_string_literal: true

require 'rails_helper'

RSpec.configure do |config|
  config.openapi_root = Rails.root.join('swagger').to_s

  config.openapi_specs = {
    'v1/swagger.yaml' => {
      openapi: '3.0.1',
      info: {
        title: 'Eventify API',
        version: 'v1',
        description: 'API documentation for the Eventify platform'
      },
      servers: [
        { url: ENV.fetch('SWAGGER_SERVER_URL', 'http://127.0.0.1:3000'), description: 'Local server' }
      ],
      components: {
        securitySchemes: {
          bearer_auth: {
            type: :http,
            scheme: :bearer,
            bearerFormat: 'JWT',
            description: 'Provide your JWT token. Prefix with "Bearer " is handled automatically by Swagger UI.'
          }
        },
        schemas: {

          User: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              name: { type: :string, example: 'John Doe' },
              email: { type: :string, example: 'john@example.com' }
            }
          },

          AuthResponse: {
            type: :object,
            properties: {
              token: { type: :string, example: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxfQ.abc' },
              user: { '$ref' => '#/components/schemas/User' }
            }
          },

          Category: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              name: { type: :string, example: 'Music' }
            },
            required: %w[id name]
          },

          Brand: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              name: { type: :string, example: 'Tech Corp' },
              description: { type: :string, example: 'A great brand', nullable: true },
              subdomain: { type: :string, example: 'tech-corp' },
              logo_url: { type: :string, example: 'https://cdn.example.com/logo.png', nullable: true },
              primary_color: { type: :string, example: '#FF5733' },
              secondary_color: { type: :string, example: '#FFFFFF' }
            },
            required: %w[id name subdomain]
          },

          BrandInput: {
            type: :object,
            properties: {
              name: { type: :string, example: 'Tech Corp' },
              description: { type: :string, example: 'A great brand' },
              subdomain: { type: :string, example: 'tech-corp' },
              logo_url: { type: :string, example: 'https://cdn.example.com/logo.png' },
              primary_color: { type: :string, example: '#FF5733' },
              secondary_color: { type: :string, example: '#FFFFFF' }
            },
            required: %w[name subdomain]
          },

          Event: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              title: { type: :string, example: 'Tech Summit 2025' },
              description: { type: :string, example: 'Annual tech conference', nullable: true },
              location: { type: :string, example: 'Kyiv, Ukraine' },
              status: {
                type: :string,
                enum: %w[draft draft_on_review published rejected
                         published_unverified published_on_review
                         published_rejected archived cancelled],
                example: 'draft'
              },
              start_date: { type: :string, format: 'date-time', example: '2025-12-01T10:00:00.000Z' },
              end_date: { type: :string, format: 'date-time', example: '2025-12-02T18:00:00.000Z', nullable: true },
              brand_id: { type: :integer, example: 1 },
              created_at: { type: :string, format: 'date-time' },
              brand: {
                type: :object,
                properties: {
                  id: { type: :integer, example: 1 },
                  name: { type: :string, example: 'Tech Corp' }
                }
              },
              categories: {
                type: :array,
                items: { '$ref' => '#/components/schemas/Category' }
              }
            },
            required: %w[id title location status start_date brand_id]
          },

          EventInput: {
            type: :object,
            properties: {
              title: { type: :string, example: 'Tech Summit 2025' },
              description: { type: :string, example: 'Annual conference', nullable: true },
              location: { type: :string, example: 'Kyiv, Ukraine' },
              start_date: { type: :string, format: 'date-time', example: '2025-12-01T10:00:00Z' },
              end_date: { type: :string,  format: 'date-time', example: '2025-12-02T18:00:00Z', nullable: true },
              brand_id: { type: :integer, example: 1 },
              category_ids: { type: :array, items: { type: :integer }, example: [1, 2] }
            },
            required: %w[title location start_date brand_id]
          },

          EventFeedback: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              ticket_id: { type: :integer, example: 5 },
              rating: { type: :integer, example: 5, nullable: true },
              comment: { type: :string, example: 'Great event!', nullable: true }
            }
          },

          ReviewInput: {
            type: :object,
            properties: {
              rating: { type: :integer, example: 5 },
              comment: { type: :string, example: 'Amazing experience!' }
            }
          },

          ValidationErrors: {
            type: :object,
            properties: {
              errors: {
                type: :object,
                example: { title: ["can't be blank"], location: ['is too long'] }
              }
            }
          },

          ErrorMessages: {
            type: :object,
            properties: {
              errors: {
                type: :array,
                items: { type: :string },
                example: ["Name can't be blank", 'Subdomain has already been taken']
              }
            }
          },

          NotFound: {
            type: :object,
            properties: {
              error: { type: :string, example: 'Event not found' }
            }
          },

          Unauthorized: {
            type: :object,
            properties: {
              error: { type: :string, example: 'Unauthorized' }
            }
          }
        }
      },
      paths: {}
    }
  }

  config.openapi_format = :yaml
end
