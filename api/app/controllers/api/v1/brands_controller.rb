# frozen_string_literal: true

module Api
  module V1
    class BrandsController < ApplicationController
      rescue_from ActionController::ParameterMissing do |e|
        render json: { error: e.message }, status: :bad_request
      end

      before_action :authenticate_user!, except: %i[index show]
      before_action :set_brand, only: %i[show update destroy]

      def index
        render json: Brand.all
      end

      def show
        render json: @brand, include: :events
      end

      def create
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

      def update
        authorize @brand

        if @brand.update(brand_params)
          render json: @brand, status: :ok
        else
          render json: { errors: @brand.errors.full_messages },
                 status: :unprocessable_content
        end
      rescue ActiveRecord::RecordNotUnique
        render json: { errors: ['Subdomain is already taken'] },
               status: :unprocessable_content
      end

      def destroy
        authorize @brand
        @brand.destroy
        head :no_content
      end

      private

      def authenticate_user!
        render json: { error: 'Unauthorized' }, status: :unauthorized unless current_user
      end

      def current_user
        return @current_user if defined?(@current_user)

        token = request.headers['Authorization']&.split&.last
        return nil unless token

        begin
          decoded_token = AuthHelper.decode(token)

          user_id = decoded_token.is_a?(Array) ? decoded_token.first['user_id'] : decoded_token[:user_id]

          @current_user = User.find_by(id: user_id)
        rescue StandardError
          nil
        end
      end

      def set_brand
        @brand = Brand.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Brand not found' }, status: :not_found
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
