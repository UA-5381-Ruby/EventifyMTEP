# frozen_string_literal: true

module Api
  module V1
    class BrandMembershipsController < ApplicationController
      before_action :set_brand
      before_action :set_membership, only: %i[update destroy]

      def index
        memberships = @brand.brand_memberships.includes(:user)
        paginated = paginate(memberships)

        render json: {
          data: paginated[:records].as_json(
            include: { user: { only: %i[id name email] } }
          ),
          meta: paginated[:meta]
        }, status: :ok
      end

      def create
        @membership = @brand.brand_memberships.build(create_membership_params)

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
          return render json: { errors: { base: ['Cannot downgrade the last owner of a brand'] } },
                        status: :unprocessable_content
        end

        if @membership.update(update_membership_params)
          render json: @membership, status: :ok
        else
          render json: { errors: @membership.errors }, status: :unprocessable_content
        end
      end

      def destroy
        if last_owner_removal?
          return render json: { errors: { base: ['Cannot remove the last owner of a brand'] } },
                        status: :unprocessable_content
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
        @membership = @brand.brand_memberships.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Membership not found in this brand' }, status: :not_found
      end

      def create_membership_params
        params.expect(membership: %i[user_id role])
      end

      def update_membership_params
        params.expect(membership: %i[role])
      end

      def paginate(scope)
        total = scope.count
        per_page = params.fetch(:per_page, 20).to_i.clamp(1, 100)
        page = [params.fetch(:page, 1).to_i, 1].max

        records = scope.offset((page - 1) * per_page).limit(per_page)

        {
          records: records,
          meta: { page: page, per_page: per_page, total: total }
        }
      end

      def duplicate_membership_error?
        @membership.errors[:user_id]&.any? { |e| e.include?('taken') }
      end

      def render_duplicate_error
        render json: {
          errors: { base: ['User is already a member of this brand'] }
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
