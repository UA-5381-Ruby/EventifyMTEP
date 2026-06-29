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
          PaginationMeta: {
            type: :object,
            properties: {
              current_page: { type: :integer },
              per_page: { type: :integer },
              total_count: { type: :integer },
              total_pages: { type: :integer }
            },
            required: %w[current_page per_page total_count total_pages]
          },

          # Activities pagination meta is remapped by the controller to
          # page/per_page/total/pages instead of the shared PaginationMeta shape.
          ActivitiesPaginationMeta: {
            type: :object,
            properties: {
              page: { type: :integer },
              per_page: { type: :integer },
              total: { type: :integer },
              pages: { type: :integer }
            },
            required: %w[page per_page total pages]
          },

          User: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              name: { type: :string, example: 'John Doe' },
              email: { type: :string, example: 'john@example.com' },
              is_superadmin: { type: :boolean, example: false }
            },
            required: %w[id name email is_superadmin]
          },

          CurrentUser: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              name: { type: :string, example: 'John Doe' },
              email: { type: :string, example: 'john@example.com' },
              is_superadmin: { type: :boolean, example: false },
              created_at: { type: :string, format: 'date-time' },
              memberships: {
                type: :array,
                items: { '$ref' => '#/components/schemas/CurrentUserMembership' }
              }
            },
            required: %w[id name email is_superadmin created_at memberships]
          },

          CurrentUserMembership: {
            type: :object,
            properties: {
              id: { type: :string, example: '1' },
              role: { type: :string, example: 'owner' },
              brand: {
                type: :object,
                properties: {
                  id: { type: :integer, example: 1 },
                  name: { type: :string, example: 'Tech Corp' },
                  subdomain: { type: :string, example: 'tech-corp' },
                  description: { type: :string, example: 'A great brand', nullable: true },
                  logo_url: { type: :string, example: 'https://cdn.example.com/logo.png', nullable: true }
                }
              }
            },
            required: %w[id role brand]
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

          # NOTE: role enum reflects InvitationsController::ALLOWED_ROLES.
          BrandMembership: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              user_id: { type: :integer, example: 5 },
              brand_id: { type: :integer, example: 1 },
              role: {
                type: :string,
                enum: %w[owner manager member],
                example: 'manager'
              },
              created_at: { type: :string, format: 'date-time' },
              user: {
                type: :object,
                properties: {
                  id: { type: :integer, example: 5 },
                  name: { type: :string, example: 'Jane Doe' },
                  email: { type: :string, example: 'jane@example.com' }
                }
              }
            },
            required: %w[id user_id brand_id role]
          },

          BrandMembershipCreateInput: {
            type: :object,
            properties: {
              membership: {
                type: :object,
                properties: {
                  user_id: { type: :integer, example: 5 },
                  role: {
                    type: :string,
                    enum: %w[owner manager member],
                    example: 'manager'
                  }
                },
                required: %w[user_id role]
              }
            },
            required: %w[membership]
          },

          BrandMembershipUpdateInput: {
            type: :object,
            properties: {
              membership: {
                type: :object,
                properties: {
                  role: {
                    type: :string,
                    enum: %w[owner manager member],
                    example: 'manager'
                  }
                },
                required: %w[role]
              }
            },
            required: %w[membership]
          },

          # NOTE: no Invitation list/show endpoints exist in routes.rb (create + accept only).
          InvitationCreateInput: {
            type: :object,
            properties: {
              email: { type: :string, example: 'invitee@example.com' },
              role: {
                type: :string,
                enum: %w[owner manager member],
                example: 'member'
              }
            },
            required: %w[email role]
          },

          InvitationAcceptInput: {
            type: :object,
            properties: {
              token: { type: :string, example: 'abc123signedtoken' }
            },
            required: %w[token]
          },

          MessageResponse: {
            type: :object,
            properties: {
              message: { type: :string, example: 'Done' }
            },
            required: %w[message]
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
              end_date: { type: :string, format: 'date-time', example: '2025-12-02T18:00:00Z', nullable: true },
              brand_id: { type: :integer, example: 1 },
              category_ids: { type: :array, items: { type: :integer }, example: [1, 2] }
            },
            required: %w[title location start_date brand_id]
          },

          EventCategoryInput: {
            type: :object,
            properties: {
              event_category: {
                type: :object,
                properties: {
                  category_id: { type: :integer, example: 1 }
                },
                required: %w[category_id]
              }
            },
            required: %w[event_category]
          },

          Ticket: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              user_id: { type: :integer, example: 5 },
              event_id: { type: :integer, example: 10 },
              qr_code: { type: :string, example: '550e8400-e29b-41d4-a716-446655440000' },
              qr_code_url: { type: :string, example: 'https://cdn.example.com/tickets/qr/example.png', nullable: true },
              is_active: { type: :boolean, example: true },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' },
              event: {
                type: :object,
                properties: {
                  id: { type: :integer, example: 10 },
                  title: { type: :string, example: 'Tech Summit 2025' },
                  location: { type: :string, example: 'Kyiv, Ukraine' },
                  start_date: { type: :string, format: 'date-time', example: '2025-12-01T10:00:00.000Z' },
                  end_date: { type: :string, format: 'date-time', example: '2025-12-02T18:00:00.000Z', nullable: true }
                }
              },
              event_feedback: {
                type: :object,
                properties: {
                  id: { type: :integer, example: 1 },
                  rating: { type: :integer, minimum: 1, maximum: 5, example: 5, nullable: true },
                  comment: { type: :string, example: 'Great event!', nullable: true }
                },
                nullable: true
              }
            },
            required: %w[id user_id event_id qr_code is_active]
          },

          TicketInput: {
            type: :object,
            properties: {
              ticket: {
                type: :object,
                properties: {
                  event_id: { type: :integer, example: 10 }
                },
                required: %w[event_id]
              }
            },
            required: %w[ticket]
          },

          TicketUpdateInput: {
            type: :object,
            properties: {
              ticket: {
                type: :object,
                properties: {
                  is_active: { type: :boolean, example: false }
                }
              }
            },
            required: %w[ticket]
          },

          TicketList: {
            type: :object,
            properties: {
              data: {
                type: :array,
                items: { '$ref' => '#/components/schemas/Ticket' }
              },
              meta: { '$ref' => '#/components/schemas/PaginationMeta' }
            },
            required: %w[data meta]
          },

          EventFeedback: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              rating: { type: :integer, minimum: 1, maximum: 5, example: 5, nullable: true },
              comment: { type: :string, example: 'Great event!', nullable: true },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: %w[id]
          },

          ReviewInput: {
            type: :object,
            properties: {
              ticket: {
                type: :object,
                properties: {
                  rating: { type: :integer, minimum: 1, maximum: 5, example: 5 },
                  comment: { type: :string, example: 'Amazing experience!' }
                }
              }
            },
            required: %w[ticket]
          },

          ContactInput: {
            type: :object,
            properties: {
              contact: {
                type: :object,
                properties: {
                  name: { type: :string, example: 'Jane Doe' },
                  email: { type: :string, example: 'jane@example.com' },
                  subject: { type: :string, example: 'Question about an event' },
                  message: { type: :string, example: 'I have a question about an event.' }
                },
                required: %w[name email subject message]
              }
            },
            required: %w[contact]
          },

          # Activities response shape is custom-formatted in the controller
          # (matches ActivitiesController#format_activities exactly).
          Activity: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              actor: {
                type: :object,
                properties: {
                  id: { type: :integer, example: 5, nullable: true },
                  email: { type: :string, example: 'jane@example.com' },
                  name: { type: :string, example: 'Jane Doe', nullable: true }
                }
              },
              type: { type: :string, example: 'event.published' },
              resource: { type: :string, example: 'Event', nullable: true },
              resource_id: { type: :integer, example: 10, nullable: true },
              resource_name: { type: :string, example: 'Tech Summit 2025', nullable: true },
              timestamp: { type: :string, format: 'date-time' },
              details: { type: :object, additionalProperties: true, nullable: true },
              ip_address: { type: :string, example: '127.0.0.1', nullable: true },
              status: { type: :string, example: 'success', nullable: true }
            },
            required: %w[id actor type timestamp]
          },

          ValidationErrors: {
            type: :object,
            properties: {
              errors: {
                type: :object,
                additionalProperties: {
                  type: :array,
                  items: { type: :string }
                },
                example: {
                  title: ["can't be blank"],
                  location: ['is too long']
                }
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

          BaseError: {
            type: :object,
            properties: {
              errors: {
                type: :object,
                properties: {
                  base: { type: :array, items: { type: :string } }
                },
                example: { base: ['User is already a member of this brand'] }
              }
            }
          },

          SimpleError: {
            type: :object,
            properties: {
              error: { type: :string, example: 'Something went wrong' }
            }
          },

          NotFound: {
            type: :object,
            properties: {
              error: { type: :string, example: 'Resource not found' }
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

      paths: {
        '/api/v1/auth/register' => {
          post: {
            summary: 'Register a new user',
            tags: ['Auth'],
            parameters: [],
            responses: {
              '201' => { description: 'successfully registered' },
              '422' => { description: 'validation error (malformed attributes)' }
            },
            requestBody: {
              content: {
                'application/json' => {
                  schema: {
                    type: :object,
                    properties: {
                      name: { type: :string, example: 'John Doe' },
                      email: { type: :string, example: 'johndoe@example.com' },
                      password: { type: :string, example: 'password123' }
                    },
                    required: %w[name email password]
                  }
                }
              }
            }
          }
        },

        '/api/v1/auth/login' => {
          post: {
            summary: 'Authenticate user (get token)',
            tags: ['Auth'],
            parameters: [],
            responses: {
              '200' => { description: 'successful login' },
              '401' => { description: 'invalid email or password' }
            },
            requestBody: {
              content: {
                'application/json' => {
                  schema: {
                    type: :object,
                    properties: {
                      email: { type: :string, example: 'johndoe@example.com' },
                      password: { type: :string, example: 'password123' }
                    },
                    required: %w[email password]
                  }
                }
              }
            }
          }
        },

        '/api/v1/auth/confirm_email' => {
          post: {
            summary: 'Confirm email address',
            tags: ['Auth'],
            description: "Confirms a user's email address via a token sent by email. Routed " \
              'as POST confirmations#create (not a GET, despite REST naming convention).',
            parameters: [],
            responses: {
              '200' => { description: 'Email confirmed successfully' },
              '400' => {
                description: 'Invalid or expired confirmation token',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/SimpleError' } } }
              }
            },
            requestBody: {
              content: {
                'application/json' => {
                  schema: {
                    type: :object,
                    properties: { token: { type: :string } },
                    required: %w[token]
                  }
                }
              }
            }
          }
        },

        '/api/v1/auth/resend_confirmation' => {
          post: {
            summary: 'Resend confirmation email',
            tags: ['Auth'],
            parameters: [],
            responses: {
              '200' => {
                description: 'Confirmation email resent',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/MessageResponse' } } }
              },
              '404' => {
                description: 'user not found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              },
              '422' => {
                description: 'already confirmed',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/SimpleError' } } }
              }
            },
            requestBody: {
              content: {
                'application/json' => {
                  schema: {
                    type: :object,
                    properties: { email: { type: :string, example: 'johndoe@example.com' } },
                    required: %w[email]
                  }
                }
              }
            }
          }
        },

        '/api/v1/auth/password/reset' => {
          post: {
            summary: 'Request or confirm a password reset',
            tags: ['Auth'],
            operationId: 'password_reset',
            description: 'Dual-purpose route dispatched by routing constraint, not request body shape: ' \
              'if a `token` query param is present, the request is routed to the confirmation ' \
              'handler (passwords#update); otherwise it is routed to the request handler ' \
              '(passwords#create). Both branches respond on the same path/verb.',
            parameters: [
              {
                name: 'token',
                in: :query,
                required: false,
                schema: {
                  type: :string,
                  description: 'Password reset token. Presence of this param routes to the confirmation flow.'
                }
              }
            ],
            responses: {
              '200' => {
                description: 'Reset requested, or password updated successfully',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/MessageResponse' } } }
              },
              '400' => {
                description: 'Invalid or expired token (confirmation flow only)',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/SimpleError' } } }
              },
              '422' => {
                description: 'Validation error (confirmation flow only, e.g. blank new_password)',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/ErrorMessages' } } }
              }
            },
            requestBody: {
              content: {
                'application/json' => {
                  schema: {
                    oneOf: [
                      {
                        type: :object,
                        title: 'Password Reset Request (no token query param)',
                        properties: { email: { type: :string, example: 'user@example.com' } },
                        required: %w[email]
                      },
                      {
                        type: :object,
                        title: 'Password Reset Confirmation (token query param present)',
                        properties: { new_password: { type: :string, example: 'newpassword123' } },
                        required: %w[new_password]
                      }
                    ]
                  }
                }
              }
            }
          }
        },

        '/api/v1/auth/password/change' => {
          patch: {
            summary: 'Change password',
            tags: ['Auth'],
            operationId: 'password_change',
            description: 'Change password for the authenticated user. Requires a valid JWT and the current password.',
            security: [{ bearer_auth: [] }],
            parameters: [],
            responses: {
              '200' => {
                description: 'Password changed successfully',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/MessageResponse' } } }
              },
              '401' => {
                description: 'Missing/invalid JWT, or current_password incorrect',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/SimpleError' } } }
              },
              '422' => {
                description: 'Validation error (blank params, or password too short)',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/ErrorMessages' } } }
              }
            },
            requestBody: {
              content: {
                'application/json' => {
                  schema: {
                    type: :object,
                    properties: {
                      current_password: { type: :string, example: 'oldpassword123' },
                      new_password: { type: :string, example: 'newpassword456' }
                    },
                    required: %w[current_password new_password]
                  }
                }
              }
            }
          }
        },

        '/api/v1/contact' => {
          post: {
            summary: 'Send a contact message',
            tags: ['Contact'],
            description: 'Sends a contact/support message from a visitor or logged-in user. ' \
              'Body must be wrapped in a `contact` key.',
            parameters: [],
            responses: {
              '200' => {
                description: 'Message sent successfully',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/MessageResponse' } } }
              },
              '422' => {
                description: 'Validation failed (missing/invalid required field)',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/SimpleError' } } }
              }
            },
            requestBody: {
              required: true,
              content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/ContactInput' } } }
            }
          }
        },

        '/api/v1/users/me' => {
          get: {
            summary: 'Get current user profile with memberships',
            tags: ['Users'],
            security: [{ bearer_auth: [] }],
            responses: {
              '200' => {
                description: 'successful',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/CurrentUser' } } }
              },
              '401' => { description: 'unauthorized' }
            }
          }
        },

        '/api/v1/users' => {
          get: {
            summary: 'List all users',
            tags: ['Users'],
            security: [{ bearer_auth: [] }],
            responses: {
              '200' => {
                description: 'users listed',
                content: {
                  'application/json' => {
                    schema: { type: :array, items: { '$ref' => '#/components/schemas/User' } }
                  }
                }
              },
              '401' => { description: 'missing or invalid token' }
            }
          }
        },

        '/api/v1/users/{id}' => {
          parameters: [
            { name: 'id', in: :path, required: true, schema: { type: :integer } }
          ],
          get: {
            summary: 'View user profile',
            tags: ['Users'],
            security: [{ bearer_auth: [] }],
            responses: {
              '200' => {
                description: 'successfully found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/User' } } }
              },
              '404' => { description: 'user not found' }
            }
          },
          patch: {
            summary: 'Update user data',
            tags: ['Users'],
            security: [{ bearer_auth: [] }],
            parameters: [],
            responses: {
              '200' => {
                description: 'successfully updated',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/User' } } }
              },
              '422' => {
                description: 'validation failed',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/ErrorMessages' } } }
              }
            },
            requestBody: {
              content: {
                'application/json' => {
                  schema: {
                    type: :object,
                    properties: {
                      name: { type: :string, example: 'Updated Name' },
                      email: { type: :string, example: 'updated@example.com' },
                      password: { type: :string, example: 'newpassword123' }
                    }
                  }
                }
              }
            }
          },
          delete: {
            summary: 'Delete user',
            tags: ['Users'],
            security: [{ bearer_auth: [] }],
            responses: {
              '204' => { description: 'successfully deleted (no content)' }
            }
          }
        },

        '/api/v1/users/{user_id}/brand_memberships' => {
          parameters: [
            { name: 'user_id', in: :path, required: true, schema: { type: :integer } }
          ],
          get: {
            summary: "List a user's brand memberships",
            tags: ['Brand Memberships'],
            security: [{ bearer_auth: [] }],
            description: 'Only accessible by the user themselves or a superadmin.',
            parameters: [
              { name: 'page', in: :query, required: false, schema: { type: :integer } },
              { name: 'per_page', in: :query, required: false, schema: { type: :integer } }
            ],
            responses: {
              '200' => {
                description: 'memberships listed',
                content: {
                  'application/json' => {
                    schema: {
                      type: :object,
                      properties: {
                        data: { type: :array, items: { '$ref' => '#/components/schemas/BrandMembership' } },
                        meta: { '$ref' => '#/components/schemas/PaginationMeta' }
                      }
                    }
                  }
                }
              },
              '403' => {
                description: 'forbidden (not self, not superadmin)',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/SimpleError' } } }
              }
            }
          }
        },

        '/api/v1/activities' => {
          get: {
            summary: 'List activities',
            tags: ['Activities'],
            security: [{ bearer_auth: [] }],
            description: 'Superadmin-only audit log of platform activity.',
            parameters: [
              { name: 'page', in: :query, required: false, schema: { type: :integer } },
              { name: 'per_page', in: :query, required: false, schema: { type: :integer } },
              { name: 'activity_types', in: :query, required: false, schema: { type: :string } },
              { name: 'resource', in: :query, required: false, schema: { type: :string, example: 'Event' } },
              { name: 'status', in: :query, required: false, schema: { type: :string } },
              { name: 'email', in: :query, required: false, schema: { type: :string } }
            ],
            responses: {
              '200' => {
                description: 'activities listed',
                content: {
                  'application/json' => {
                    schema: {
                      type: :object,
                      properties: {
                        data: { type: :array, items: { '$ref' => '#/components/schemas/Activity' } },
                        meta: { '$ref' => '#/components/schemas/ActivitiesPaginationMeta' }
                      }
                    }
                  }
                }
              },
              '401' => { description: 'unauthorized' },
              '403' => {
                description: 'forbidden (not superadmin)',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/SimpleError' } } }
              }
            }
          }
        },

        '/api/v1/events' => {
          get: {
            summary: 'List events',
            tags: ['Events'],
            security: [{ bearer_auth: [] }],
            description: 'Returns a paginated list of events.',
            parameters: [
              { name: 'page', in: :query, required: false, schema: { type: :integer } },
              { name: 'per_page', in: :query, required: false, schema: { type: :integer } }
            ],
            responses: {
              '200' => {
                description: 'events listed',
                content: {
                  'application/json' => {
                    schema: {
                      type: :object,
                      properties: {
                        data: { type: :array, items: { '$ref' => '#/components/schemas/Event' } },
                        meta: { '$ref' => '#/components/schemas/PaginationMeta' }
                      },
                      required: %w[data meta]
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Create event',
            tags: ['Events'],
            security: [{ bearer_auth: [] }],
            description: 'Creates a new event. Status defaults to draft.',
            parameters: [],
            responses: {
              '201' => {
                description: 'event created',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Event' } } }
              },
              '422' => {
                description: 'validation failed',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/ValidationErrors' } } }
              }
            },
            requestBody: {
              required: true,
              content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/EventInput' } } }
            }
          }
        },

        '/api/v1/events/{id}' => {
          parameters: [
            { name: 'id', in: :path, required: true, schema: { type: :integer } }
          ],
          get: {
            summary: 'Show event',
            tags: ['Events'],
            security: [{ bearer_auth: [] }],
            responses: {
              '200' => {
                description: 'event found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Event' } } }
              },
              '404' => {
                description: 'event not found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              }
            }
          },
          patch: {
            summary: 'Update event',
            tags: ['Events'],
            security: [{ bearer_auth: [] }],
            parameters: [],
            responses: {
              '200' => {
                description: 'event updated',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Event' } } }
              },
              '404' => {
                description: 'event not found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              },
              '422' => {
                description: 'validation failed',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/ValidationErrors' } } }
              }
            },
            requestBody: {
              required: true,
              content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/EventInput' } } }
            }
          }
        },

        # NOTE: there is no DELETE /api/v1/events/{id} route. Event lifecycle is
        # managed exclusively through the status-transition endpoints below.

        '/api/v1/events/{id}/submit' => {
          parameters: [
            { name: 'id', in: :path, required: true, schema: { type: :integer } }
          ],
          post: {
            summary: 'Submit event for review',
            tags: ['Event Transitions'],
            security: [{ bearer_auth: [] }],
            description: 'AASM-driven status transition. Requires all required event fields ' \
              'to be filled before submission is allowed.',
            parameters: [],
            responses: {
              '200' => {
                description: 'event submitted',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Event' } } }
              },
              '404' => {
                description: 'event not found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              },
              '422' => {
                description: 'invalid transition for current status, or required fields missing',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/SimpleError' } } }
              }
            }
          }
        },

        '/api/v1/events/{id}/cancel' => {
          parameters: [
            { name: 'id', in: :path, required: true, schema: { type: :integer } }
          ],
          post: {
            summary: 'Cancel event',
            tags: ['Event Transitions'],
            security: [{ bearer_auth: [] }],
            parameters: [],
            responses: {
              '200' => {
                description: 'event cancelled',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Event' } } }
              },
              '404' => {
                description: 'event not found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              },
              '422' => {
                description: 'invalid transition for current status',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/SimpleError' } } }
              }
            }
          }
        },

        '/api/v1/events/{id}/approve' => {
          parameters: [
            { name: 'id', in: :path, required: true, schema: { type: :integer } }
          ],
          post: {
            summary: 'Approve event',
            tags: ['Event Transitions'],
            security: [{ bearer_auth: [] }],
            parameters: [],
            responses: {
              '200' => {
                description: 'event approved',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Event' } } }
              },
              '404' => {
                description: 'event not found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              },
              '422' => {
                description: 'invalid transition for current status',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/SimpleError' } } }
              }
            }
          }
        },

        '/api/v1/events/{id}/reject' => {
          parameters: [
            { name: 'id', in: :path, required: true, schema: { type: :integer } }
          ],
          post: {
            summary: 'Reject event',
            tags: ['Event Transitions'],
            security: [{ bearer_auth: [] }],
            parameters: [],
            responses: {
              '200' => {
                description: 'event rejected',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Event' } } }
              },
              '404' => {
                description: 'event not found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              },
              '422' => {
                description: 'invalid transition for current status',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/SimpleError' } } }
              }
            },
            requestBody: {
              content: {
                'application/json' => {
                  schema: {
                    type: :object,
                    properties: {
                      reason: { type: :string, example: 'Does not meet content guidelines' },
                      event: {
                        type: :object,
                        properties: {
                          reason: { type: :string, example: 'Does not meet content guidelines' }
                        }
                      }
                    },
                    description: 'Reason may be sent either top-level or nested under `event` ' \
                      '(controller checks both via params.dig(:event, :reason) || params[:reason]).'
                  }
                }
              }
            }
          }
        },

        '/api/v1/events/{id}/reviews' => {
          parameters: [
            { name: 'id', in: :path, required: true, schema: { type: :integer } }
          ],
          get: {
            summary: 'List reviews for an event',
            tags: ['Events'],
            security: [{ bearer_auth: [] }],
            description: 'UNVERIFIED — this route exists in routes.rb (events#reviews) but no ' \
              'controller source was available to confirm response shape, auth, or ' \
              'pagination. Update this block once Events::ReviewsController (or ' \
              'equivalent) is reviewed.',
            responses: {
              '200' => { description: 'reviews listed (response shape unverified)' }
            }
          }
        },

        '/api/v1/events/{event_id}/categories' => {
          parameters: [
            { name: 'event_id', in: :path, required: true, schema: { type: :integer } }
          ],
          get: {
            summary: 'List categories for an event',
            tags: ['Event Categories'],
            description: "Public. Returns the event's categories.",
            responses: {
              '200' => {
                description: 'categories listed',
                content: {
                  'application/json' => {
                    schema: { type: :array, items: { '$ref' => '#/components/schemas/Category' } }
                  }
                }
              },
              '404' => {
                description: 'event not found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              }
            }
          },
          post: {
            summary: 'Add a category to an event',
            tags: ['Event Categories'],
            security: [{ bearer_auth: [] }],
            description: 'Restricted to brand owner/manager or superadmin. One category per ' \
              'request (body takes a single category_id, not an array).',
            parameters: [],
            responses: {
              '201' => {
                description: 'category linked to event. Returns the linked Category.',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Category' } } }
              },
              '404' => {
                description: 'event not found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              },
              '422' => {
                description: 'validation failed, or category already assigned to event',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/ValidationErrors' } } }
              }
            },
            requestBody: {
              required: true,
              content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/EventCategoryInput' } } }
            }
          }
        },

        '/api/v1/events/{event_id}/categories/{category_id}' => {
          parameters: [
            { name: 'event_id', in: :path, required: true, schema: { type: :integer } },
            { name: 'category_id', in: :path, required: true, schema: { type: :integer } }
          ],
          delete: {
            summary: 'Remove a category from an event',
            tags: ['Event Categories'],
            security: [{ bearer_auth: [] }],
            description: 'Restricted to brand owner/manager or superadmin. category_id is ' \
              'a path parameter, not a request body field.',
            responses: {
              '204' => { description: 'category removed from event (no content)' },
              '404' => {
                description: 'event not found, or category not assigned to this event',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              }
            }
          }
        },

        '/api/v1/brands' => {
          get: {
            summary: 'List brands',
            tags: ['Brands'],
            security: [{ bearer_auth: [] }],
            responses: {
              '200' => {
                description: 'brands listed',
                content: {
                  'application/json' => {
                    schema: {
                      type: :object,
                      properties: {
                        data: { type: :array, items: { '$ref' => '#/components/schemas/Brand' } },
                        meta: { '$ref' => '#/components/schemas/PaginationMeta' }
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Create brand',
            tags: ['Brands'],
            security: [{ bearer_auth: [] }],
            parameters: [],
            responses: {
              '201' => {
                description: 'brand created',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Brand' } } }
              },
              '422' => {
                description: 'validation failed',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/ErrorMessages' } } }
              }
            },
            requestBody: {
              required: true,
              content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/BrandInput' } } }
            }
          }
        },

        '/api/v1/brands/{id}' => {
          parameters: [
            { name: 'id', in: :path, required: true, schema: { type: :integer } }
          ],
          get: {
            summary: 'Show brand',
            tags: ['Brands'],
            security: [{ bearer_auth: [] }],
            responses: {
              '200' => {
                description: 'brand found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Brand' } } }
              },
              '404' => {
                description: 'brand not found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              }
            }
          },
          patch: {
            summary: 'Update brand',
            tags: ['Brands'],
            security: [{ bearer_auth: [] }],
            parameters: [],
            responses: {
              '200' => {
                description: 'brand updated',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Brand' } } }
              },
              '404' => {
                description: 'brand not found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              },
              '422' => {
                description: 'validation failed',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/ErrorMessages' } } }
              }
            },
            requestBody: {
              required: true,
              content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/BrandInput' } } }
            }
          },
          delete: {
            summary: 'Delete brand',
            tags: ['Brands'],
            security: [{ bearer_auth: [] }],
            responses: {
              '204' => { description: 'brand deleted (no content)' },
              '404' => {
                description: 'brand not found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              }
            }
          }
        },

        '/api/v1/brands/{brand_id}/memberships' => {
          parameters: [
            { name: 'brand_id', in: :path, required: true, schema: { type: :integer } }
          ],
          get: {
            summary: 'List brand memberships',
            tags: ['Brand Memberships'],
            security: [{ bearer_auth: [] }],
            description: 'Returns all members of a brand. Requires manage_memberships? or ' \
              'show_brand_memberships? authorization.',
            parameters: [
              { name: 'page', in: :query, required: false, schema: { type: :integer } },
              { name: 'per_page', in: :query, required: false, schema: { type: :integer } }
            ],
            responses: {
              '200' => {
                description: 'memberships listed',
                content: {
                  'application/json' => {
                    schema: {
                      type: :object,
                      properties: {
                        data: { type: :array, items: { '$ref' => '#/components/schemas/BrandMembership' } },
                        meta: { '$ref' => '#/components/schemas/PaginationMeta' }
                      }
                    }
                  }
                }
              },
              '401' => {
                description: 'unauthorized',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Unauthorized' } } }
              },
              '404' => {
                description: 'brand not found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              }
            }
          },
          post: {
            summary: 'Add member to brand',
            tags: ['Brand Memberships'],
            security: [{ bearer_auth: [] }],
            parameters: [],
            responses: {
              '201' => {
                description: 'membership created',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/BrandMembership' } } }
              },
              '422' => {
                description: 'validation failed, or user already a member',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/BaseError' } } }
              },
              '401' => {
                description: 'unauthorized',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Unauthorized' } } }
              }
            },
            requestBody: {
              required: true,
              content: {
                'application/json' => { schema: { '$ref' => '#/components/schemas/BrandMembershipCreateInput' } }
              }
            }
          }
        },

        '/api/v1/brands/{brand_id}/memberships/{id}' => {
          parameters: [
            { name: 'brand_id', in: :path, required: true, schema: { type: :integer } },
            { name: 'id', in: :path, required: true, schema: { type: :integer } }
          ],
          patch: {
            summary: 'Update member role',
            tags: ['Brand Memberships'],
            security: [{ bearer_auth: [] }],
            description: "Blocked if this would downgrade the brand's last remaining owner.",
            parameters: [],
            responses: {
              '200' => {
                description: 'membership updated',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/BrandMembership' } } }
              },
              '404' => {
                description: 'membership not found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              },
              '422' => {
                description: 'validation failed, or would remove last owner',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/BaseError' } } }
              },
              '401' => {
                description: 'unauthorized',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Unauthorized' } } }
              }
            },
            requestBody: {
              required: true,
              content: {
                'application/json' => { schema: { '$ref' => '#/components/schemas/BrandMembershipUpdateInput' } }
              }
            }
          },
          delete: {
            summary: 'Remove member from brand',
            tags: ['Brand Memberships'],
            security: [{ bearer_auth: [] }],
            description: "Blocked if this would remove the brand's last remaining owner.",
            responses: {
              '204' => { description: 'membership removed (no content)' },
              '404' => {
                description: 'membership not found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              },
              '422' => {
                description: 'would remove last owner',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/BaseError' } } }
              },
              '401' => {
                description: 'unauthorized',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Unauthorized' } } }
              }
            }
          }
        },

        '/api/v1/brands/{brand_id}/invitations' => {
          parameters: [
            { name: 'brand_id', in: :path, required: true, schema: { type: :integer } }
          ],
          post: {
            summary: 'Send invitation',
            tags: ['Invitations'],
            security: [{ bearer_auth: [] }],
            description: 'Sends an email invitation to join a brand. Requires manage_memberships? ' \
              'authorization. NOTE: there is no index or destroy route for invitations — ' \
              'this create action and the accept action below are the only invitation ' \
              'endpoints that exist. The controller does not appear to persist an ' \
              'Invitation record; it sends mail directly and returns a message.',
            parameters: [],
            responses: {
              '200' => {
                description: 'invitation sent',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/MessageResponse' } } }
              },
              '422' => {
                description: 'invalid role or invalid email',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/SimpleError' } } }
              },
              '401' => {
                description: 'unauthorized',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Unauthorized' } } }
              },
              '404' => {
                description: 'brand not found or access denied',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              }
            },
            requestBody: {
              required: true,
              content: {
                'application/json' => { schema: { '$ref' => '#/components/schemas/InvitationCreateInput' } }
              }
            }
          }
        },

        '/api/v1/brands/{brand_id}/invitations/accept' => {
          parameters: [
            { name: 'brand_id', in: :path, required: true, schema: { type: :integer } }
          ],
          post: {
            summary: 'Accept a brand invitation',
            tags: ['Invitations'],
            description: 'Accepts a brand invitation via a token (from the email link). This is ' \
              'brand-scoped (token is validated against the specific :brand_id in the ' \
              'path), NOT a standalone /invitations/accept endpoint, and the token is ' \
              'sent in the request body, not as a query param.',
            parameters: [],
            responses: {
              '200' => {
                description: 'invitation accepted, membership created',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/MessageResponse' } } }
              },
              '400' => {
                description: 'invalid, expired, or mismatched token',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/SimpleError' } } }
              }
            },
            requestBody: {
              required: true,
              content: {
                'application/json' => { schema: { '$ref' => '#/components/schemas/InvitationAcceptInput' } }
              }
            }
          }
        },

        '/api/v1/categories' => {
          get: {
            summary: 'List categories',
            tags: ['Categories'],
            responses: {
              '200' => {
                description: 'categories listed',
                content: {
                  'application/json' => {
                    schema: { type: :array, items: { '$ref' => '#/components/schemas/Category' } }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Create category',
            tags: ['Categories'],
            security: [{ bearer_auth: [] }],
            parameters: [],
            responses: {
              '201' => {
                description: 'category created',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Category' } } }
              },
              '422' => { description: 'validation failed' }
            },
            requestBody: {
              required: true,
              content: {
                'application/json' => {
                  schema: {
                    type: :object,
                    properties: { name: { type: :string, example: 'Music' } },
                    required: %w[name]
                  }
                }
              }
            }
          }
        },

        '/api/v1/my_tickets' => {
          get: {
            summary: "List the current user's tickets (alias)",
            tags: ['Tickets'],
            security: [{ bearer_auth: [] }],
            description: 'Identical to GET /api/v1/tickets — both route to tickets#index. ' \
              'Kept as a separate alias path for backward compatibility.',
            responses: {
              '200' => {
                description: 'tickets listed',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/TicketList' } } }
              },
              '401' => {
                description: 'unauthorized',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Unauthorized' } } }
              }
            }
          }
        },

        '/api/v1/tickets' => {
          get: {
            summary: 'List user tickets',
            tags: ['Tickets'],
            security: [{ bearer_auth: [] }],
            description: 'Returns a paginated, filterable, sortable list of tickets owned ' \
              'by the current user.',
            parameters: [
              { name: 'page', in: :query, required: false, schema: { type: :integer } },
              { name: 'per_page', in: :query, required: false, schema: { type: :integer } },
              { name: 'sort', in: :query, required: false, schema: { type: :string } },
              { name: 'order', in: :query, required: false, schema: { type: :string } },
              { name: 'q', in: :query, required: false, schema: { type: :string } },
              { name: 'is_active', in: :query, required: false, schema: { type: :boolean } },
              { name: 'event_id', in: :query, required: false, schema: { type: :integer } }
            ],
            responses: {
              '200' => {
                description: 'tickets listed',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/TicketList' } } }
              },
              '401' => {
                description: 'unauthorized',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Unauthorized' } } }
              }
            }
          },
          post: {
            summary: 'Create ticket',
            tags: ['Tickets'],
            security: [{ bearer_auth: [] }],
            description: 'Creates a new ticket for the current user for a specified event. ' \
              'QR code is auto-generated.',
            parameters: [],
            responses: {
              '201' => {
                description: 'ticket created',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Ticket' } } }
              },
              '422' => {
                description: 'validation failed, or user already registered for event',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/ValidationErrors' } } }
              },
              '401' => {
                description: 'unauthorized',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Unauthorized' } } }
              }
            },
            requestBody: {
              required: true,
              content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/TicketInput' } } }
            }
          }
        },

        # NOTE: there is no DELETE /api/v1/tickets/{id} route. Tickets are
        # deactivated via PATCH (is_active: false), not destroyed.

        '/api/v1/tickets/{id}' => {
          parameters: [
            { name: 'id', in: :path, required: true, schema: { type: :integer } }
          ],
          get: {
            summary: 'Show ticket',
            tags: ['Tickets'],
            security: [{ bearer_auth: [] }],
            description: 'Returns a specific ticket with its associated event and feedback.',
            responses: {
              '200' => {
                description: 'ticket found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Ticket' } } }
              },
              '404' => {
                description: 'ticket not found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              },
              '401' => {
                description: 'unauthorized',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Unauthorized' } } }
              }
            }
          },
          patch: {
            summary: 'Update ticket',
            tags: ['Tickets'],
            security: [{ bearer_auth: [] }],
            description: "Updates a ticket's is_active status.",
            parameters: [],
            responses: {
              '200' => {
                description: 'ticket updated',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Ticket' } } }
              },
              '404' => {
                description: 'ticket not found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              },
              '401' => {
                description: 'unauthorized',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Unauthorized' } } }
              }
            },
            requestBody: {
              required: true,
              content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/TicketUpdateInput' } } }
            }
          }
        },

        '/api/v1/tickets/{id}/review' => {
          parameters: [
            { name: 'id', in: :path, required: true, schema: { type: :integer } }
          ],
          post: {
            summary: 'Create or update ticket review',
            tags: ['Tickets'],
            security: [{ bearer_auth: [] }],
            description: 'Creates or updates event feedback (review) for a ticket.',
            parameters: [],
            responses: {
              '200' => {
                description: 'review created or updated successfully',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/EventFeedback' } } }
              },
              '404' => {
                description: 'ticket not found',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              },
              '401' => {
                description: 'unauthorized',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Unauthorized' } } }
              },
              '422' => {
                description: 'validation failed',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/ErrorMessages' } } }
              }
            },
            requestBody: {
              required: true,
              content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/ReviewInput' } } }
            }
          },
          delete: {
            summary: 'Delete ticket review',
            tags: ['Tickets'],
            security: [{ bearer_auth: [] }],
            description: 'Removes the event feedback (review) associated with a ticket. ' \
              'Routed as a DELETE to the same /review path (tickets#destroy_review).',
            responses: {
              '204' => { description: 'review deleted (no content)' },
              '404' => {
                description: 'ticket not found, or ticket has no review to delete',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/NotFound' } } }
              },
              '401' => {
                description: 'unauthorized',
                content: { 'application/json' => { schema: { '$ref' => '#/components/schemas/Unauthorized' } } }
              }
            }
          }
        }
      }
    }
  }

  config.openapi_format = :yaml
end
