# frozen_string_literal: true

module Api
  module V1
    class UsersController < ApplicationController
      before_action :require_authentication!, only: %i[me index show update destroy]
      before_action :set_user, only: %i[show update destroy]

      # GET /api/v1/users/me
      def me
        @user = current_user
        authorize @user, :me?

        render json: {
          id: @user.id,
          name: @user.name,
          email: @user.email,
          is_superadmin: @user.is_superadmin,
          created_at: @user.created_at,
          memberships: formatted_memberships(@user)
        }, status: :ok
      end

      # GET /api/v1/users
      def index
        users = User.all
        authorize users
        render json: users, only: %i[id name email is_superadmin], status: :ok
      end

      # GET /api/v1/users/:id
      def show
        authorize @user
        render json: @user, only: %i[id name email is_superadmin], status: :ok
      end

      # PATCH/PUT /api/v1/users/:id
      def update
        authorize @user

        if @user.update(user_params)
          render json: @user, only: %i[id name email is_superadmin], status: :ok
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_content
        end
      end

      # DELETE /api/v1/users/:id
      def destroy
        authorize @user

        @user.destroy
        head :no_content
      end

      private

      def formatted_memberships(user)
        user.brand_memberships.includes(:brand).map do |membership|
          {
            id: membership.id.to_s,
            role: membership.role,
            brand: {
              id: membership.brand.id,
              name: membership.brand.name,
              subdomain: membership.brand.subdomain,
              description: membership.brand.description,
              logo_url: membership.brand.logo_url
            }
          }
        end
      end

      def set_user
        @user = User.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'User not found' }, status: :not_found
      end

      def user_params
        permitted_attributes = %i[name email password]

        if params[:user].present?
          params.expect(user: permitted_attributes)
        else
          params.permit(*permitted_attributes)
        end
      end
    end
  end
end
