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

        return render json: { error: 'Invalid role' }, status: :unprocessable_entity unless ALLOWED_ROLES.include?(role)

        unless email.match?(/\A[^@\s]+@[^@\s]+\.[^@\s]+\z/)
          return render json: { error: 'Invalid email' }, status: :unprocessable_entity
        end

        MailerService.send_brand_invitation(email, @brand, role)

        render json: { message: 'Invitation sent' }, status: :ok
      end

      # POST /api/v1/brands/:brand_id/invitations/accept
      def accept
        result = InvitationAcceptanceService.new(token: params[:token], brand: @brand).call

        if result.success?
          render json: { message: 'You have joined the brand successfully' }, status: :ok
        else
          render json: { error: result.error }, status: result.status
        end
      end

      private

      def load_brand
        @brand = Brand.find(params[:brand_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Brand not found' }, status: :not_found
      end
    end
  end
end
