# frozen_string_literal: true

module Api
  module V1
    class BrandsController < ApplicationController
      rescue_from ActionController::ParameterMissing do |e|
        render json: { error: e.message }, status: :bad_request
      end

      before_action :set_brand, only: %i[show update destroy]

      # GET /api/v1/brands
      def index
        render json: accessible_brands
      end

      # GET /api/v1/brands/:id
      def show
        render json: @brand, include: :events
      end

      # POST /api/v1/brands
      def create
        return render_not_implemented unless current_user

        brand = Brand.new(brand_params)

        ActiveRecord::Base.transaction do
          brand.save!
          BrandMembership.create!(
            brand: brand,
            user: current_user,
            role: 'owner'
          )
        end

        render json: brand, status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages },
               status: :unprocessable_content
      end

      # PATCH /api/v1/brands/:id
      def update
        authorize @brand

        if @brand.update(brand_params)
          render json: @brand, status: :ok
        else
          render json: { errors: @brand.errors.full_messages },
                 status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotUnique
        render json: { errors: ['Subdomain is already taken'] },
               status: :unprocessable_entity
      end

      # DELETE /api/v1/brands/:id
      def destroy
        authorize @brand

        @brand.destroy
        head :no_content
      end

      private

      def render_not_implemented
        render json: { error: 'Authentication not implemented yet' },
               status: :not_implemented
      end

      def current_user
        @current_user ||= User.first || User.create!(
          email: 'temp_organizer@example.com',
          password: 'password123'
        )
      end

      def set_brand
        @brand = accessible_brands.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Brand not found' }, status: :not_found
      end

      def accessible_brands
        return Brand.all if current_user.blank?

        current_user.brands
      end

      def brand_params
        params.expect(
          brand: %i[
            name
            description
            logo_url
            subdomain
            primary_color
            secondary_color
          ]
        )
      end
    end
  end
end
