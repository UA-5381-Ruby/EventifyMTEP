# frozen_string_literal: true

module Api
  module V1
    class BrandMembershipsController < ApplicationController
      include Paginatable

      before_action :set_brand, if: -> { params[:brand_id].present? }
      before_action :set_membership, only: %i[update destroy]
      before_action :authorize_membership, only: %i[update destroy]

      def index
        if params[:brand_id].present?
          authorize @brand, :show_brand_memberships?
          memberships = @brand.brand_memberships.includes(:user)
          serializer_opts = { include: { user: { only: %i[id name email] } } }
        else
          unless params[:user_id].to_i == current_user.id || current_user.is_superadmin?
            return render json: { error: t('api.v1.errors.forbidden') }, status: :forbidden
          end

          user = User.find(params[:user_id])
          memberships = user.brand_memberships.includes(:brand)
          serializer_opts = { include: { brand: { only: %i[id name subdomain], methods: [:logo_url] } } }
        end

        paginated = paginate(memberships)

        render json: {
          data: paginated[:records].as_json(serializer_opts),
          meta: paginated[:meta]
        }, status: :ok
      end

      def create
        @membership = @brand.brand_memberships.build(create_membership_params)
        authorize @membership

        begin
          if @membership.save
            render json: @membership, status: :created
          elsif duplicate_membership_error?
            render_duplicate_error
          else
            render json: { errors: @membership.errors }, status: :unprocessable_content
          end
        rescue ActiveRecord::RecordNotUnique
          render_duplicate_error
        end
      end

      def update
        new_role = update_membership_params[:role]

        if last_owner_downgrade?(new_role)
          return render json: {
            errors: { base: [t('api.v1.errors.brand_memberships.cannot_downgrade_last_owner')] }
          }, status: :unprocessable_content
        end

        if @membership.update(update_membership_params)
          render json: @membership, status: :ok
        else
          render json: { errors: @membership.errors }, status: :unprocessable_content
        end
      end

      def destroy
        if last_owner_removal?
          return render json: {
            errors: { base: [t('api.v1.errors.brand_memberships.cannot_remove_last_owner')] }
          }, status: :unprocessable_content
        end

        @membership.destroy
        head :no_content
      end

      private

      def set_brand
        @brand = Brand.find(params[:brand_id])
        authorize @brand, :manage_memberships?
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
        render json: {
          errors: { base: [t('api.v1.errors.brand_memberships.already_member')] }
        }, status: :unprocessable_content
      end

      def last_owner_downgrade?(new_role)
        @membership.role == 'owner' &&
          new_role != 'owner' &&
          owners_count <= 1
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
