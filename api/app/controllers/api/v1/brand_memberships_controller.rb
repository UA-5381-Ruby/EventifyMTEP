# frozen_string_literal: true

module Api
  module V1
    class BrandMembershipsController < ApplicationController
      include Paginatable

      before_action :set_brand, if: -> { params[:brand_id].present? }
      before_action :set_membership, only: %i[update destroy]

      def index
        params[:brand_id].present? ? index_for_brand : index_for_user
      end

      def create
        @membership = @brand.brand_memberships.build(create_membership_params)
        authorize @membership

        save_membership
      rescue ActiveRecord::RecordNotUnique
        render_base_error(t('api.v1.errors.brand_memberships.already_member'))
      end

      def update
        authorize @membership

        if ownership_guard.downgrade_blocked?(update_membership_params[:role])
          return render_base_error(t('api.v1.errors.brand_memberships.cannot_downgrade_last_owner'))
        end

        if @membership.update(update_membership_params)
          render json: @membership, status: :ok
        else
          render json: { errors: @membership.errors }, status: :unprocessable_content
        end
      end

      def destroy
        authorize @membership
        if ownership_guard.removal_blocked?
          return render_base_error(t('api.v1.errors.brand_memberships.cannot_remove_last_owner'))
        end

        @membership.destroy
        head :no_content
      end

      private

      def save_membership
        if @membership.save
          render json: @membership, status: :created
        elsif @membership.errors[:user_id]&.any? { |e| e.include?('taken') }
          render_base_error(t('api.v1.errors.brand_memberships.already_member'))
        else
          render json: { errors: @membership.errors }, status: :unprocessable_content
        end
      end

      def index_for_brand
        authorize @brand, :show_brand_memberships?
        render_memberships(@brand.brand_memberships.includes(:user), include: { user: { only: %i[id name email] } })
      end

      def index_for_user
        return render_error(t('api.v1.errors.forbidden'), :forbidden) unless authorized_user_index?

        memberships = User.find(params[:user_id]).brand_memberships.includes(:brand)
        render_memberships(memberships, include: { brand: { only: %i[id name subdomain], methods: [:logo_url] } })
      end

      def authorized_user_index?
        params[:user_id].to_i == current_user.id || current_user.is_superadmin?
      end

      def render_memberships(memberships, serializer_opts)
        paginated = paginate(memberships)
        render json: {
          data: paginated[:records].as_json(serializer_opts),
          meta: paginated[:meta]
        }, status: :ok
      end

      def set_brand
        @brand = Brand.find(params[:brand_id])
        authorize @brand, :manage_memberships?
      rescue ActiveRecord::RecordNotFound
        render_error(t('api.v1.errors.brands.not_found_or_access_denied'), :not_found)
      rescue Pundit::NotAuthorizedError
        render_error(t('api.v1.errors.forbidden'), :forbidden)
      end

      def set_membership
        @membership = @brand.brand_memberships.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_error(t('api.v1.errors.brand_memberships.not_found'), :not_found)
      end

      def ownership_guard
        @ownership_guard ||= BrandMembershipOwnershipGuard.new(@membership)
      end

      def create_membership_params
        params.expect(membership: %i[user_id role])
      end

      def update_membership_params
        params.expect(membership: %i[role])
      end

      def render_error(message, status)
        render json: { error: message }, status: status
      end

      def render_base_error(message)
        render json: { errors: { base: [message] } }, status: :unprocessable_content
      end
    end
  end
end
