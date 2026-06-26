# frozen_string_literal: true

module Api
  module V1
    class ContactController < ApplicationController
      skip_before_action :authenticate_user!, raise: false

      def create
        permitted = params.require(:contact).permit(:name, :email, :subject, :message)

        unless valid_contact?(permitted)
          return render json: { error: 'Invalid parameters' }, status: :unprocessable_entity
        end

        MailerService.send_contact_message(permitted)
        render json: { message: 'Message sent successfully' }, status: :ok
      end

      private

      def valid_contact?(contact)
        contact[:name].present? &&
          contact[:email].present? &&
          contact[:email].match?(URI::MailTo::EMAIL_REGEXP) &&
          contact[:subject].present? &&
          contact[:message].present?
      end
    end
  end
end
