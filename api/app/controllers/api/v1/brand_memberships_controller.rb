# frozen_string_literal: true

module Api
  module V1
    class BrandMembershipsController < ApplicationController
      include Paginatable

      before_action :set_brand, if: -> { params[:brand_id].present? }
      before_action :set_membership, only: %i[update destroy]
      before_action :authorize_membership, only: %i[update destroy]

      def index
        memberships, serializer_opts = params[:brand_id].present? ? index_for_brand : index_for_user
        return if performed?

        paginated = paginate(memberships)
        render json: { data: paginated[:records].as_json(serializer_opts), meta: paginated[:meta] }, status: :ok
      end

      def create
        @membership = @brand.brand_memberships.build(create_membership_params)
        authorize @membership
        save_membership
      end

      def update
        return render_error(:cannot_downgrade_last_owner) if last_owner_downgrade?(update_membership_params[:role])

        if @membership.update(update_membership_params)
          render json: @membership, status: :ok
        else
          render json: { errors: @membership.errors }, status: :unprocessable_content
        end
      end

      def destroy
        return render_error(:cannot_remove_last_owner) if last_owner_removal?

        @membership.destroy
        head :no_content
      end

      private

      def index_for_brand
        authorize @brand, :show_brand_memberships?
        [@brand.brand_memberships.includes(:user), { include: { user: { only: %i[id name email] } } }]
      end

      def index_for_user
        unless params[:user_id].to_i == current_user.id || current_user.is_superadmin?
          return render json: { error: t('api.v1.errors.forbidden') }, status: :forbidden
        end

        [
          User.find(params[:user_id]).brand_memberships.includes(:brand),
          { include: { brand: { only: %i[id name subdomain], methods: [:logo_url] } } }
        ]
      end

      def save_membership
        if @membership.save
          render json: @membership, status: :created
        else
          duplicate_membership_error? ? render_duplicate_error : render_validation_errors
        end
      rescue ActiveRecord::RecordNotUnique
        render_duplicate_error
      end

      def set_brand
        @brand = Brand.find(params[:brand_id])
        authorize @brand, :manage_memberships?
      rescue ActiveRecord::RecordNotFound
        render json: { error: t('api.v1.errors.brands.not_found_or_access_denied') }, status: :not_found
      rescue Pundit::NotAuthorizedError
        render json: { error: t('api.v1.errors.forbidden') }, status: :forbidden
      end

      def set_membership
        @membership = @brand.brand_memberships.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: t('api.v1.errors.brand_memberships.not_found') }, status: :not_found
      end

      def authorize_membership
        authorize @membership
      end

      def create_membership_params
        params.expect(membership: %i[user_id role])
      end

      def update_membership_params
        params.expect(membership: %i[role])
      end

      def duplicate_membership_error?
        @membership.errors[:user_id]&.any? { |e| e.include?('taken') }
      end

      def render_duplicate_error
        render_error(:already_member)
      end

      def render_validation_errors
        render json: { errors: @membership.errors }, status: :unprocessable_content
      end

      def render_error(key)
        render json: { errors: { base: [t("api.v1.errors.brand_memberships.#{key}")] } }, status: :unprocessable_content
      end

      def last_owner_downgrade?(new_role)
        @membership.role == 'owner' && new_role != 'owner' && owners_count <= 1
      end

      def last_owner_removal?
        @membership.role == 'owner' && owners_count <= 1
      end

      def owners_count
        @brand.brand_memberships.where(role: 'owner').count
      end
    end
  end
end
