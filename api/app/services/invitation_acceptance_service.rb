# frozen_string_literal: true

class InvitationAcceptanceService
  Result = Data.define(:success?, :error, :status)

  def initialize(token:, brand:)
    @token = token
    @brand = brand
  end

  def call
    unless valid_payload?
      return failure(I18n.t('services.invitation_acceptance.invalid_or_expired'),
                     :unprocessable_content)
    end
    unless matching_brand?
      return failure(I18n.t('services.invitation_acceptance.brand_mismatch'),
                     :unprocessable_content)
    end
    return failure(I18n.t('services.invitation_acceptance.no_account'), :not_found) unless user
    return failure(I18n.t('services.invitation_acceptance.already_member'), :conflict) if existing_member?

    save_membership
  rescue ActiveRecord::RecordNotUnique
    failure(I18n.t('services.invitation_acceptance.already_member'), :conflict)
  end

  private

  def valid_payload?
    payload.present?
  end

  def matching_brand?
    payload['brand_id'] == @brand.id
  end

  def existing_member?
    BrandMembership.exists?(user: user, brand: @brand)
  end

  def save_membership
    membership = BrandMembership.new(user: user, brand: @brand, role: payload['role'])
    if membership.save
      Result.new(success?: true, error: nil, status: :ok)
    else
      failure(membership.errors.full_messages, :unprocessable_entity)
    end
  end

  def failure(error, status)
    Result.new(success?: false, error: error, status: status)
  end

  def user
    @user ||= User.find_by('LOWER(email) = ?', payload['email'])
  end

  def payload
    @payload ||= InvitationTokenService.decode(@token)
  end
end
