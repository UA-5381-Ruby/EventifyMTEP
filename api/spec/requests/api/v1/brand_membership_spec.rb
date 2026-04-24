# frozen_string_literal: true

# spec/requests/api/v1/brand_memberships_spec.rb
require 'rails_helper'

RSpec.describe 'Api::V1::BrandMemberships', type: :request do
  let(:brand) { create(:brand) }
  let(:owner_user) { create(:user) }
  let(:other_user) { create(:user) }

  let!(:owner_brand_membership) { create(:brand_membership, brand: brand, user: owner_user, role: 'owner') }

  # Генеруємо заголовки з JWT токеном замість старого sign_in
  let(:headers) { auth_headers(owner_user) }

  describe 'PATCH /api/v1/brands/:brand_id/memberships/:id' do
    context 'when the user is the last owner' do
      it 'does not allow downgrading the role to manager' do
        patch "/api/v1/brands/#{brand.id}/memberships/#{owner_brand_membership.id}",
              params: { membership: { role: 'manager' } },
              headers: headers, # Додано заголовки
              as: :json         # Додано формат

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)['errors']['base']).to include('Cannot downgrade the last owner of a brand')
        expect(owner_brand_membership.reload.role).to eq('owner')
      end
    end

    context 'when there are multiple owners' do
      let!(:second_owner) { create(:brand_membership, brand: brand, user: other_user, role: 'owner') }

      it 'allows downgrading one of the owners' do
        patch "/api/v1/brands/#{brand.id}/memberships/#{owner_brand_membership.id}",
              params: { membership: { role: 'manager' } },
              headers: headers, # Додано заголовки
              as: :json         # Додано формат

        expect(response).to have_http_status(:ok)
        expect(owner_brand_membership.reload.role).to eq('manager')
      end
    end
  end

  describe 'DELETE /api/v1/brands/:brand_id/memberships/:id' do
    context 'when the user is the last owner' do
      it 'does not allow deleting the brand_membership' do
        # Додано заголовки
        delete "/api/v1/brands/#{brand.id}/memberships/#{owner_brand_membership.id}",
               headers: headers

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)['errors']['base']).to include('Cannot remove the last owner of a brand')

        expect(BrandMembership.exists?(owner_brand_membership.id)).to be_truthy
      end
    end
  end

  describe 'POST /api/v1/brands/:brand_id/memberships' do
    context 'when the user is already a member of the brand (RecordNotUnique)' do
      let!(:existing_brand_membership) { create(:brand_membership, brand: brand, user: other_user, role: 'user') }

      it 'returns 422 instead of 500' do
        post "/api/v1/brands/#{brand.id}/memberships",
             params: { membership: { user_id: other_user.id, role: 'manager' } },
             headers: headers, # Додано заголовки
             as: :json         # Додано формат

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)['errors']['base']).to include('User is already a member of this brand')
      end
    end
  end
end
