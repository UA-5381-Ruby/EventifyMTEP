# frozen_string_literal: true

module Api
  module V1
    class InvitationsController < ApplicationController
      ALLOWED_ROLES = %w[owner manager member].freeze

      before_action :load_brand
      before_action :require_authentication!, only: %i[create]

      # POST /api/v1/brands/:brand_id/invitations
      def create
        authorize @brand, :manage_memberships?

        email = params[:email].to_s.strip.downcase
        role  = params[:role].to_s

        error = invitation_validation_error(email, role)
        return render json: { error: error }, status: :unprocessable_entity if error

        MailerService.send_brand_invitation(email, @brand, role)
        render json: { message: t('api.v1.errors.invitations.sent') }, status: :ok
      end

      # POST /api/v1/brands/:brand_id/invitations/accept
      def accept
        result = InvitationAcceptanceService.new(token: params[:token], brand: @brand).call

        if result.success?
          render json: { message: t('api.v1.errors.invitations.joined_success') }, status: :ok
        else
          render json: { error: result.error }, status: result.status
        end
      end

      private

      def load_brand
        @brand = Brand.find(params[:brand_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: t('api.v1.errors.brands.not_found_or_access_denied') }, status: :not_found
      end

      def invitation_validation_error(email, role)
        unless ALLOWED_ROLES.include?(role)
          return render json: { error: t('api.v1.errors.invitations.invalid_role') }, status: :unprocessable_content
        end

        unless email.match?(/\A[^@\s]+@[^@\s]+\.[^@\s]+\z/)
          return render json: { error: t('api.v1.errors.invitations.invalid_email') }, status: :unprocessable_content
        end

        nil
      end
    end
  end
end
