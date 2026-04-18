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
        # TODO: remove guard when auth is ready
        unless current_user
          return render json: { error: 'Authentication not implemented yet' },
                        status: :not_implemented
        end

        brand = Brand.new(brand_params)

        ActiveRecord::Base.transaction do
          brand.save!
          Organizer.create!(brand: brand, user: current_user)
        end

        render json: brand, status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages },
               status: :unprocessable_content
      end

      private

      # TODO: replace with real auth when JWT is ready
      def current_user
        nil
      end

      def set_brand
        @brand = accessible_brands.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Brand not found' }, status: :not_found
      end

      def accessible_brands
        # TODO: scope to current_user.brands when auth is ready
        return Brand.all if current_user.blank?

        current_user.brands
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
