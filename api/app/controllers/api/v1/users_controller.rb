# frozen_string_literal: true

module Api
  module V1
    class UsersController < ApplicationController
      before_action :set_user, only: %i[show update destroy]

      # GET /api/v1/users
      def index
        users = User.all
        authorize users # Pundit перевірить метод index?
        render json: users, only: %i[id name email is_superadmin], status: :ok
      end

      # GET /api/v1/users/:id
      def show
        authorize @user # Pundit перевірить метод show?
        render json: @user, only: %i[id name email is_superadmin], status: :ok
      end

      # PATCH/PUT /api/v1/users/:id
      def update
        authorize @user

        if @user.update(user_params)
          render json: @user, only: %i[id name email is_superadmin], status: :ok
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/users/:id
      def destroy
        authorize @user

        @user.destroy
        head :no_content
      end

      private

      def set_user
        @user = User.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'User not found' }, status: :not_found
      end

      def user_params
        params.permit(:name, :email, :password, :password_confirmation)
      end
    end
  end
end
