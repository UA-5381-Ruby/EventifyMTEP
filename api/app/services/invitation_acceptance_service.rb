# frozen_string_literal: true

class InvitationAcceptanceService
  Result = Data.define(:success?, :error, :status)

  def initialize(token:, brand:)
    @token = token
    @brand = brand
  end

  def call
    return failure('Invalid or expired invitation link', :unprocessable_entity) unless valid_payload?
    return failure('Invitation is for a different brand', :unprocessable_entity) unless matching_brand?
    return failure('No account found. Please register first.', :not_found) unless user
    return failure('User is already a member of this brand', :conflict) if existing_member?

    save_membership
  rescue ActiveRecord::RecordNotUnique
    failure('User is already a member of this brand', :conflict)
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
