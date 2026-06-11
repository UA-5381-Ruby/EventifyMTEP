# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength

module Api
  module V1
    class BrandsController < ApplicationController
      include Paginatable

      class MediaUploadError < StandardError; end

      rescue_from ActionController::ParameterMissing do |e|
        render json: { error: e.message }, status: :bad_request
      end

      rescue_from MediaUploadError do |e|
        render json: { errors: [e.message] }, status: :unprocessable_content
      end

      before_action :set_brand, only: %i[update destroy]
      before_action :set_brand_public, only: %i[show]

      def index
        brands = fetch_brands_by_scope(params[:scope])
        brands = filter_by_query(brands)
        brands = sort_brands(brands)

        paginated = paginate(brands)

        render json: {
          data: paginated[:records].as_json(methods: [:logo_url]),
          meta: paginated[:meta]
        }
      end

      def show
        render json: @brand.as_json(
          methods: [:logo_url],
          include: { events: { only: %i[id title status start_date] } }
        )
      end

      def create
        attrs = process_logo_upload(brand_params.to_h)
        brand = Brand.new(attrs)

        ActiveRecord::Base.transaction do
          brand.save!
          BrandMembership.create!(
            brand: brand,
            user: current_user,
            role: 'owner'
          )
        end

        render json: brand.as_json(methods: [:logo_url]), status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages },
               status: :unprocessable_content
      end

      def update
        authorize @brand

        attrs = process_logo_upload(brand_params.to_h)

        if @brand.update(attrs)
          render json: @brand.as_json(methods: [:logo_url]), status: :ok
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

      def process_logo_upload(attrs)
        attrs = attrs.with_indifferent_access
        file = attrs[:logo]

        if file.present? && file.is_a?(ActionDispatch::Http::UploadedFile)
          allowed_types = %w[
            image/jpeg 
            image/png 
            image/webp 
            image/gif 
            image/svg+xml
          ]
          unless file.content_type.in?(allowed_types)
            raise MediaUploadError, 'Invalid logo format. Allowed types: JPG, PNG, WEBP, GIF, SVG.'
          end

          if file.size > 5.megabytes
            raise MediaUploadError, 'Logo file size must be under 5MB.'
          end

          s3_key = S3BucketService.new.upload(file, folder: 'brands/logos')

          raise MediaUploadError, 'Failed to upload logo to cloud storage. Please try again.' if s3_key.nil?

          attrs[:logo] = s3_key
        end

        attrs
      end

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
            logo
            subdomain
            primary_color
            secondary_color
          ]
        )
      end
    end
  end
end
# rubocop:enable Metrics/ClassLength
