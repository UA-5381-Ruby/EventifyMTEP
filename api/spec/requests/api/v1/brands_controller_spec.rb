require 'swagger_helper'

RSpec.describe Api::V1::BrandsController, type: :controller do
  let(:brand) { instance_double('Brand', id: 1) }
  let(:valid_params) { { name: 'Test Brand' } }
  let(:user) { instance_double('User') }

  before do
    allow(controller).to receive(:authorize_request).and_return(true)
    allow(controller).to receive(:current_user).and_return(user)
    
    allow(Brand).to receive(:find).and_return(brand)
    allow(Brand).to receive(:find_by).and_return(brand)
    
    allow(controller).to receive(:authorize).with(brand).and_return(true)
    allow(controller).to receive(:brand_params).and_return(valid_params)
    controller.instance_variable_set(:@brand, brand)
  end

  context 'PUT #update' do
    context 'when update is successful' do
      before do
        allow(brand).to receive(:update).with(valid_params).and_return(true)
        allow(brand).to receive(:to_json).and_return('{"id":1,"name":"Test Brand"}')
      end

      it 'returns status ok' do
        put :update, params: { id: 1 }
        
        expect(response).to have_http_status(:ok)
      end
    end

    context 'when update fails' do
      let(:errors) { instance_double('ActiveModel::Errors', full_messages: ['Invalid name']) }

      before do
        allow(brand).to receive(:update).with(valid_params).and_return(false)
        allow(brand).to receive(:errors).and_return(errors)
      end

      it 'returns unprocessable_content status and errors' do
        put :update, params: { id: 1 }
        
        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)).to eq({ 'errors' => ['Invalid name'] })
      end
    end

    context 'when ActiveRecord::RecordNotUnique is raised' do
      before do
        allow(brand).to receive(:update).with(valid_params).and_raise(ActiveRecord::RecordNotUnique)
      end

      it 'returns unprocessable_content status and subdomain error' do
        put :update, params: { id: 1 }
        
        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)).to eq({ 'errors' => ['Subdomain is already taken'] })
      end
    end
  end
end