# frozen_string_literal: true

module Api
  module V1
    class InvitationsController < ApplicationController
      ALLOWED_ROLES = %w[owner manager member].freeze
      before_action :load_brand

      # POST /api/v1/brands/:brand_id/invitations
      def create
        authorize @brand, :manage_memberships?

        email = params[:email].to_s.strip.downcase
        role  = params[:role].to_s


        unless ALLOWED_ROLES.include?(role)

        end
        unless email.match?(/\A[^@\s]+@[^@\s]+\.[^@\s]+\z/)
          return render json: { error: 'Invalid email' }, status: :unprocessable_entity
        end

        token = MailerService.send_brand_invitation(email, @brand, role)

        render json: { message: 'Invitation sent' }, status: :ok
      end

      # POST /api/v1/brands/:brand_id/invitations/accept
      def accept
        payload = InvitationTokenService.decode(params[:token])

        unless payload
          return render json: { error: 'Invalid or expired invitation link' }, status: :unprocessable_entity
        end

        # payload має string ключі, не символи
        unless payload['brand_id'] == @brand.id
          return render json: { error: 'Invitation is for a different brand' }, status: :unprocessable_entity
        end

        user = User.find_by('LOWER(email) = ?', payload['email'])

        unless user
          return render json: { error: 'No account found. Please register first.' }, status: :not_found
        end

        membership = BrandMembership.find_or_initialize_by(user: user, brand: @brand)

        if membership.persisted?
          return render json: { error: 'User is already a member of this brand' }, status: :conflict
        end

        membership.role = payload['role']

        begin
          if membership.save
            render json: { message: 'You have joined the brand successfully' }, status: :ok
          else
            render json: { errors: membership.errors.full_messages }, status: :unprocessable_entity
          end
        rescue ActiveRecord::RecordNotUnique
          render json: { error: 'User is already a member of this brand' }, status: :conflict
        end
      end

      private

      def load_brand
        @brand = Brand.find(params[:brand_id])
      end
    end
  end
end
