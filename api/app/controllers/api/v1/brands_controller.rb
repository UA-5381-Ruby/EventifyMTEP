# frozen_string_literal: true

module Api
  module V1
    class BrandsController < ApplicationController
      # TODO: authentication will be added later by team (JWT-based)
      # before_action :authenticate_user!

      before_action :set_brand, only: [:show]

      # GET /api/v1/brands
      def index
        # TODO: when auth is ready
        # render json: current_user.brands

        render json: Brand.all
      end

      # GET /api/v1/brands/:id
      def show
        render json: @brand, include: :events
      end

      # POST /api/v1/brands
      def create
        brand = Brand.new(brand_params)

        if brand.save
          # TODO: when User model + auth is ready
          # Organizer.create!(brand: brand, user: current_user)

          render json: brand, status: :created
        else
          render json: { errors: brand.errors.full_messages },
                 status: :unprocessable_content
        end
      end

      private

      def set_brand
        # TODO: later restrict by current_user.brands to enforce multi-tenant isolation
        @brand = Brand.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Brand not found' }, status: :not_found
      end

      def brand_params
        params.expect(
          brand: %i[name
                    description
                    logo_url
                    subdomain
                    primary_color
                    secondary_color]
        )
      end
    end
  end
end
