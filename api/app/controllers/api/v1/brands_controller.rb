# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength

module Api
  module V1
    class BrandsController < ApplicationController
      include Paginatable

      class MediaUploadError < StandardError; end

      MAX_LOGO_SIZE = 5.megabytes
      ALLOWED_LOGO_TYPES = %w[image/jpeg image/png image/webp image/gif image/svg+xml].freeze

      rescue_from ActionController::ParameterMissing do |e|
        render json: { error: e.message }, status: :bad_request
      end

      before_action :require_authentication!
      rescue_from MediaUploadError do |e|
        render json: { errors: [e.message] }, status: :unprocessable_content
      end

      rescue_from ActiveRecord::RecordNotUnique do
        render json: {
          errors: [I18n.t('api.v1.errors.brands.subdomain_taken')]
        }, status: :unprocessable_content
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
      end

      def destroy
        authorize @brand

        if @brand.destroy!
          head :no_content
        else
          render json: { error: @brand.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      private

      def process_logo_upload(attrs)
        attrs = attrs.with_indifferent_access
        file = attrs[:logo]

        if file.present? && file.is_a?(ActionDispatch::Http::UploadedFile)
          attrs[:logo] =
            validated_media_key(file, folder: 'brands/logos',
                                      error_scope: 'api.v1.errors.brands.logo')
        end

        attrs
      end

      def validated_media_key(file, folder:, error_scope:)
        raise MediaUploadError, t("#{error_scope}.invalid_format") unless file.content_type.in?(ALLOWED_LOGO_TYPES)
        raise MediaUploadError, t("#{error_scope}.too_large", max_size: '5MB') if file.size > MAX_LOGO_SIZE

        s3_key = S3BucketService.new.upload(file, folder: folder)
        raise MediaUploadError, t("#{error_scope}.upload_failed") if s3_key.nil?

        s3_key
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
        @brand = if current_user.is_superadmin?
                   Brand.find(params[:id])
                 else
                   current_user.brands.find(params[:id])
                 end
      rescue ActiveRecord::RecordNotFound
        render json: { error: t('api.v1.errors.brands.not_found_or_access_denied') }, status: :not_found
      end

      def set_brand_public
        @brand = Brand.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: t('api.v1.errors.brands.not_found_or_access_denied') }, status: :not_found
      end

      def brand_params
        params.require(:brand).permit(
          :name,
          :description,
          :logo,
          :subdomain,
          :primary_color,
          :secondary_color
        )
      end
    end
  end
end
# rubocop:enable Metrics/ClassLength
