# frozen_string_literal: true

module Api
  module V1
    class CategoriesController < ApplicationController
      def index
        @categories = Category.all
        render json: @categories
      end

      def create
        @category = Category.new(category_params)
        if @category.save
          render json: @category, status: :created
        else
          render json: @category.errors, status: :unprocessable_content
        end
      end

      private

      def category_params
        params.expect(category: [:name])
      end
    end
  end
end
