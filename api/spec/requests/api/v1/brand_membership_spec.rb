# frozen_string_literal: true

# spec/requests/api/v1/brand_memberships_spec.rb

require 'swagger_helper'

RSpec.describe 'Api::V1::BrandMemberships', type: :request do
  let(:brand) { create(:brand) }
  let(:owner_user) { create(:user) }
  let(:other_user) { create(:user) }

  let!(:owner_brand_membership) { create(:brand_membership, brand: brand, user: owner_user, role: 'owner') }

  let(:headers) { auth_headers(owner_user) }

  describe 'PATCH /api/v1/brands/:brand_id/memberships/:id' do
    
    context 'when the user is the last owner' do
      it 'does not allow downgrading the role to manager' do
        patch "/api/v1/brands/#{brand.id}/memberships/#{owner_brand_membership.id}",
              params: { membership: { role: 'manager' } },
              headers: headers,
              as: :json

        expect(response).to have_http_status(:unprocessable_content)
        # Зверніть увагу: текст помилки має збігатися з моделлю (може бути "Cannot remove..." або "Cannot downgrade...")
        expect(JSON.parse(response.body)['errors']['base']).to include('Cannot downgrade the last owner of a brand')
        expect(owner_brand_membership.reload.role).to eq('owner')
      end
    end

    context 'when there are multiple owners' do
      let!(:second_owner) { create(:brand_membership, brand: brand, user: other_user, role: 'owner') }

      it 'allows downgrading one of the owners' do
        patch "/api/v1/brands/#{brand.id}/memberships/#{owner_brand_membership.id}",
              params: { membership: { role: 'manager' } },
              headers: headers,
              as: :json

        expect(response).to have_http_status(:ok)
        expect(owner_brand_membership.reload.role).to eq('manager')
      end
    end

    # --- НОВІ ТЕСТИ ДЛЯ PATCH ---
    context 'when updating a regular member' do
      let!(:regular_member) { create(:brand_membership, brand: brand, user: other_user, role: 'user') }

      it 'successfully updates the role to manager' do
        patch "/api/v1/brands/#{brand.id}/memberships/#{regular_member.id}",
              params: { membership: { role: 'manager' } },
              headers: headers,
              as: :json

        expect(response).to have_http_status(:ok)
        expect(regular_member.reload.role).to eq('manager')
      end

      it 'returns 422 when role is invalid (inclusion validation)' do
        patch "/api/v1/brands/#{brand.id}/memberships/#{regular_member.id}",
              params: { membership: { role: 'superadmin' } },
              headers: headers,
              as: :json

        expect(response).to have_http_status(:unprocessable_content)
        # Використовуємо to_s на випадок, якщо контролер формує помилки нестандартно
        expect(JSON.parse(response.body)['errors'].to_s).to include('is not included in the list')
      end
    end
  end

  describe 'DELETE /api/v1/brands/:brand_id/memberships/:id' do
   
    context 'when the user is the last owner' do
      it 'does not allow deleting the brand_membership' do
        delete "/api/v1/brands/#{brand.id}/memberships/#{owner_brand_membership.id}",
               headers: headers

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)['errors']['base']).to include('Cannot remove the last owner of a brand')
        expect(BrandMembership.exists?(owner_brand_membership.id)).to be_truthy
      end
    end

    context 'when deleting a non-owner member' do
      let!(:regular_member) { create(:brand_membership, brand: brand, user: other_user, role: 'user') }

      it 'successfully deletes the membership' do
        expect {
          delete "/api/v1/brands/#{brand.id}/memberships/#{regular_member.id}",
                 headers: headers
        }.to change(BrandMembership, :count).by(-1)

        # Перевірте, що повертає ваш контролер: :no_content (204) або :ok (200)
        expect(response).to have_http_status(:no_content).or have_http_status(:ok)
      end
    end

    context 'when there are multiple owners' do
      let!(:second_owner) { create(:brand_membership, brand: brand, user: other_user, role: 'owner') }

      it 'allows deleting an owner' do
        expect {
          delete "/api/v1/brands/#{brand.id}/memberships/#{owner_brand_membership.id}",
                 headers: headers
        }.to change(BrandMembership, :count).by(-1)

        expect(response).to have_http_status(:no_content).or have_http_status(:ok)
      end
    end
  end

  describe 'POST /api/v1/brands/:brand_id/memberships' do
    
    context 'when the user is already a member of the brand (RecordNotUnique)' do
      let!(:existing_brand_membership) { create(:brand_membership, brand: brand, user: other_user, role: 'user') }

      it 'returns 422 instead of 500' do
        post "/api/v1/brands/#{brand.id}/memberships",
             params: { membership: { user_id: other_user.id, role: 'manager' } },
             headers: headers,
             as: :json

        expect(response).to have_http_status(:unprocessable_content)
        # Ваш кастомний обробник помилок, як ми розібралися раніше
        expect(JSON.parse(response.body)['errors']['base']).to include('User is already a member of this brand')
      end
    end

    # --- НОВІ ТЕСТИ ДЛЯ POST ---
    context 'with valid parameters' do
      let(:new_user) { create(:user) }

      it 'successfully creates a new membership' do
        expect {
          post "/api/v1/brands/#{brand.id}/memberships",
               params: { membership: { user_id: new_user.id, role: 'manager' } },
               headers: headers,
               as: :json
        }.to change(BrandMembership, :count).by(1)

        # Перевірте: ваш контролер повертає :created (201) чи :ok (200)?
        expect(response).to have_http_status(:created).or have_http_status(:ok)
      end
    end

    context 'with invalid parameters' do
      let(:new_user) { create(:user) }

      it 'returns 422 when role is missing (presence validation)' do
        post "/api/v1/brands/#{brand.id}/memberships",
             params: { membership: { user_id: new_user.id, role: nil } },
             headers: headers,
             as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)['errors'].to_s).to include("can't be blank")
      end

      it 'returns 422 when user_id is missing' do
        post "/api/v1/brands/#{brand.id}/memberships",
             params: { membership: { role: 'user' } },
             headers: headers,
             as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)['errors'].to_s).to include("must exist").or include("can't be blank")
      end
    end
  end
end