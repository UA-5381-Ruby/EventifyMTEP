# frozen_string_literal: true

module Api
  module V1
    class BrandMembershipsController < ApplicationController
      before_action :set_brand
      before_action :set_membership, only: %i[update destroy]

      # GET /api/v1/brands/:brand_id/memberships
      def index
        memberships = @brand.brand_memberships.includes(:user)

        # Pagination setup (matches the style from EventsController)
        total = memberships.count
        per_page = params.fetch(:per_page, 20).to_i.clamp(1, 100)
        page = [params.fetch(:page, 1).to_i, 1].max

        memberships = memberships.offset((page - 1) * per_page).limit(per_page)

        render json: {
          data: memberships.as_json(
            include: { user: { only: %i[id name email] } }
          ),
          meta: { page: page, per_page: per_page, total: total }
        }, status: :ok
      end

      # POST /api/v1/brands/:brand_id/memberships
      def create
        @membership = @brand.brand_memberships.build(create_membership_params)

        begin
          if @membership.save
            render json: @membership, status: :created
          else
            # Check if it's a uniqueness error
            if @membership.errors[:user_id]&.any? { |e| e.include?('taken') }
              render json: { 
                errors: { base: ['User is already a member of this brand'] } 
              }, status: :unprocessable_content
            else
              render json: { errors: @membership.errors }, status: :unprocessable_content
            end
          end
        rescue ActiveRecord::RecordNotUnique
          # Explicitly catches the database-level composite unique index violation
          render json: { 
            errors: { base: ['User is already a member of this brand'] } 
          }, status: :unprocessable_content
        end
      end

      # PATCH/PUT /api/v1/brands/:brand_id/memberships/:id
      def update
        new_role = update_membership_params[:role]

        # Check if downgrading the last owner
        if @membership.role == 'owner' && new_role != 'owner' && @brand.brand_memberships.where(role: 'owner').count <= 1
          return render json: { errors: { base: ['Cannot downgrade the last owner of a brand'] } }, status: :unprocessable_content
        end

        if @membership.update(update_membership_params)
          render json: @membership, status: :ok
        else
          render json: { errors: @membership.errors }, status: :unprocessable_content
        end
      end

      # DELETE /api/v1/brands/:brand_id/memberships/:id
      def destroy
        # Check if removing the last owner
        if @membership.role == 'owner' && @brand.brand_memberships.where(role: 'owner').count <= 1
          return render json: { errors: { base: ['Cannot remove the last owner of a brand'] } }, status: :unprocessable_content
        end

        @membership.destroy
        head :no_content
      end

      private

      def set_brand
        @brand = Brand.find(params[:brand_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Brand not found' }, status: :not_found
      end

      def set_membership
        # Strictly scoping the find through the brand prevents ID hijacking
        @membership = @brand.brand_memberships.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Membership not found in this brand' }, status: :not_found
      end

      # Enforces that user_id and role are only permitted during creation
      def create_membership_params
        params.expect(membership: %i[user_id role])
      end

      # Enforces that ONLY the role can be changed during an update
      def update_membership_params
        params.expect(membership: %i[role])
      end
    end
  end
end