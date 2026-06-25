# frozen_string_literal: true

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
        expect(JSON.parse(response.body)['errors']['base']).to include(
                                                                 I18n.t('api.v1.errors.brand_memberships.cannot_downgrade_last_owner')
                                                               )
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

    context 'when updating a regular member' do
      let!(:regular_member) { create(:brand_membership, brand: brand, user: other_user, role: 'member') }

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
        expect(JSON.parse(response.body)['errors']['base']).to include(
                                                                 I18n.t('api.v1.errors.brand_memberships.cannot_remove_last_owner')
                                                               )
        expect(BrandMembership.exists?(owner_brand_membership.id)).to be_truthy
      end
    end

    context 'when deleting a non-owner member' do
      let!(:regular_member) { create(:brand_membership, brand: brand, user: other_user, role: 'member') }

      it 'successfully deletes the membership' do
        expect do
          delete "/api/v1/brands/#{brand.id}/memberships/#{regular_member.id}",
                 headers: headers
        end.to change(BrandMembership, :count).by(-1)

        expect(response).to have_http_status(:no_content).or have_http_status(:ok)
      end
    end

    context 'when there are multiple owners' do
      let!(:second_owner) { create(:brand_membership, brand: brand, user: other_user, role: 'owner') }

      it 'allows deleting an owner' do
        expect do
          delete "/api/v1/brands/#{brand.id}/memberships/#{owner_brand_membership.id}",
                 headers: headers
        end.to change(BrandMembership, :count).by(-1)

        expect(response).to have_http_status(:no_content).or have_http_status(:ok)
      end
    end
  end

  describe 'POST /api/v1/brands/:brand_id/memberships' do
    context 'when the user is already a member of the brand (RecordNotUnique)' do
      let!(:existing_brand_membership) { create(:brand_membership, brand: brand, user: other_user, role: 'member') }

      it 'returns 422 instead of 500' do
        post "/api/v1/brands/#{brand.id}/memberships",
             params: { membership: { user_id: other_user.id, role: 'manager' } },
             headers: headers,
             as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)['errors']['base']).to include(
                                                                 I18n.t('api.v1.errors.brand_memberships.already_member')
                                                               )
      end
    end

    context 'with valid parameters' do
      let(:new_user) { create(:user) }

      it 'successfully creates a new membership' do
        expect do
          post "/api/v1/brands/#{brand.id}/memberships",
               params: { membership: { user_id: new_user.id, role: 'manager' } },
               headers: headers,
               as: :json
        end.to change(BrandMembership, :count).by(1)

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
             params: { membership: { role: 'member' } },
             headers: headers,
             as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)['errors'].to_s).to include('must exist').or include("can't be blank")
      end
    end
  end

  describe 'GET /api/v1/brands/:brand_id/memberships' do
    let!(:member) { create(:brand_membership, brand: brand, user: other_user, role: 'member') }

    context 'when the brand exists and the user can manage it' do
      it 'returns the brand memberships' do
        get "/api/v1/brands/#{brand.id}/memberships", headers: headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['data'].size).to eq(2)
        expect(json['meta']).to be_present
      end
    end

    context 'when the brand does not exist' do
      it 'returns 404' do
        get '/api/v1/brands/0/memberships', headers: headers

        expect(response).to have_http_status(:not_found)
        expect(JSON.parse(response.body)['error']).to eq(
                                                        I18n.t('api.v1.errors.brands.not_found_or_access_denied')
                                                      )
      end
    end

    context 'when the user is not authorized to manage the brand' do
      let(:unauthorized_user) { create(:user) }
      let(:unauthorized_headers) { auth_headers(unauthorized_user) }

      it 'returns 403' do
        get "/api/v1/brands/#{brand.id}/memberships", headers: unauthorized_headers

        expect(response).to have_http_status(:forbidden)
        expect(JSON.parse(response.body)['error']).to eq(I18n.t('api.v1.errors.forbidden'))
      end
    end
  end

  describe 'PATCH /api/v1/brands/:brand_id/memberships/:id when membership does not exist' do
    it 'returns 404' do
      patch "/api/v1/brands/#{brand.id}/memberships/0",
            params: { membership: { role: 'manager' } },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:not_found)
      expect(JSON.parse(response.body)['error']).to eq(
                                                      I18n.t('api.v1.errors.brand_memberships.not_found')
                                                    )
    end
  end

  describe 'POST /api/v1/brands/:brand_id/memberships when a true race-condition RecordNotUnique occurs' do
    let(:new_user) { create(:user) }

    it 'rescues the DB-level error and returns 422 instead of 500' do
      allow_any_instance_of(BrandMembership).to receive(:save)
                                                  .and_raise(ActiveRecord::RecordNotUnique, 'duplicate key value violates unique constraint')

      post "/api/v1/brands/#{brand.id}/memberships",
           params: { membership: { user_id: new_user.id, role: 'manager' } },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body)['errors']['base']).to include(
                                                               I18n.t('api.v1.errors.brand_memberships.already_member')
                                                             )
    end
  end

  describe 'GET /api/v1/users/:user_id/brand_memberships' do
    let!(:owner_membership_for_user) { owner_brand_membership }

    context 'when requesting your own memberships' do
      it 'returns the memberships for the current user' do
        get "/api/v1/users/#{owner_user.id}/brand_memberships", headers: headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['data'].size).to eq(1)
      end
    end

    context 'when a superadmin requests another user\'s memberships' do
      let(:superadmin) { create(:user, is_superadmin: true) }
      let(:superadmin_headers) { auth_headers(superadmin) }

      it 'returns the memberships' do
        get "/api/v1/users/#{owner_user.id}/brand_memberships", headers: superadmin_headers

        expect(response).to have_http_status(:ok)
      end
    end

    context 'when a non-superadmin requests another user\'s memberships' do
      it 'returns 403' do
        get "/api/v1/users/#{other_user.id}/brand_memberships", headers: headers

        expect(response).to have_http_status(:forbidden)
        expect(JSON.parse(response.body)['error']).to eq(I18n.t('api.v1.errors.forbidden'))
      end
    end
  end
end
