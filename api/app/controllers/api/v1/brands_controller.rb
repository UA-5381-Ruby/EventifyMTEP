# frozen_string_literal: true

module Api
  module V1
    class BrandsController < ApplicationController
      include Paginatable

      rescue_from ActionController::ParameterMissing do |e|
        render json: { error: e.message }, status: :bad_request
      end

      before_action :set_brand, only: %i[update destroy]
      before_action :set_brand_public, only: %i[show]

      def index
        brands = fetch_brands_by_scope(params[:scope])
        brands = filter_by_query(brands)
        brands = sort_brands(brands)

        paginated = paginate(brands)

        render json: {
          data: paginated[:records],
          meta: paginated[:meta]
        }
      end

      def show
        render json: @brand.as_json(include: { events: { only: %i[id title status start_date] } })
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

      def fetch_brands_by_scope(scope)
        case scope
        when 'managed'
          Brand.joins(:brand_memberships)
               .where(brand_memberships: { user_id: current_user.id, role: %w[owner manager] })
        when 'subscribed'
          Brand.joins(:brand_memberships)
               .where(brand_memberships: { user_id: current_user.id, role: 'member' })
        when 'discover'
          Brand.where.not(
            id: BrandMembership.where(user_id: current_user.id).select(:brand_id)
          )
        else
          current_user.brands
        end
      end

      def filter_by_query(brands)
        return brands unless params[:q].present?

        brands.where('brands.name ILIKE ?', "%#{params[:q]}%")
      end

      def sort_brands(brands)
        column = params[:sort].presence_in(%w[created_at name]) || 'created_at'
        brands.order(column => :desc)
      end

      def set_brand
        @brand = current_user.brands.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Brand not found' }, status: :not_found
      end

      def set_brand_public
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
