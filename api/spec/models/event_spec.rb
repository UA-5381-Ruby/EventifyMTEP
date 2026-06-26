# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe Event, type: :model do
  subject { build(:event, brand: brand, categories: [category]) }

  let(:brand) { create(:brand) }
  let(:category) { create(:category) }

  it { is_expected.to validate_presence_of(:title) }
  it { is_expected.to validate_presence_of(:start_date) }
  it { is_expected.to validate_presence_of(:location) }
  it { is_expected.to validate_length_of(:title).is_at_most(120) }
  it { is_expected.to validate_length_of(:location).is_at_most(200) }
  it { is_expected.to validate_presence_of(:status) }

  it { is_expected.to belong_to(:brand) }
  it { is_expected.to have_many(:event_categories).dependent(:destroy) }
  it { is_expected.to have_many(:categories).through(:event_categories) }

  it { is_expected.to have_many(:tickets).dependent(:destroy) }
  it { is_expected.to have_many(:event_feedbacks).through(:tickets) }

  it do
    expect(subject).to define_enum_for(:status).with_values(
      draft: 'draft',
      draft_on_review: 'draft_on_review',
      published: 'published',
      rejected: 'rejected',
      published_unverified: 'published_unverified',
      published_on_review: 'published_on_review',
      published_rejected: 'published_rejected',
      archived: 'archived',
      cancelled: 'cancelled'
    ).backed_by_column_of_type(:enum)
  end

  describe 'reviews statistics (average_rating and reviews_count)' do
    let(:user1) { create(:user) }
    let(:user2) { create(:user) }

    let(:event) { create(:event, brand: brand, categories: [category]) }

    context 'when there are no reviews' do
      it 'returns 0.0 for average_rating' do
        expect(event.average_rating).to eq(0.0)
      end

      it 'returns 0 for reviews_count' do
        expect(event.reviews_count).to eq(0)
      end
    end

    context 'when there are multiple reviews' do
      before do
        ticket1 = create(:ticket, event: event, user: user1)
        ticket2 = create(:ticket, event: event, user: user2)

        create(:event_feedback, ticket: ticket1, rating: 4, comment: 'Good')
        create(:event_feedback, ticket: ticket2, rating: 5, comment: 'Excellent')
      end

      it 'calculates the correct average_rating' do
        expect(event.average_rating).to eq(4.5)
      end

      it 'returns the correct reviews_count' do
        expect(event.reviews_count).to eq(2)
      end
    end
  end

  describe '#remove_banner_from_s3' do
    context 'when the event has a banner' do
      it 'deletes the banner from S3 on destroy' do
        event = create(:event, brand: brand, banner: 'some/s3/key.jpg')
        s3_service = instance_double(S3BucketService)
        allow(S3BucketService).to receive(:new).and_return(s3_service)
        allow(s3_service).to receive(:delete)

        event.destroy

        expect(s3_service).to have_received(:delete).with('some/s3/key.jpg')
      end
    end

    context 'when the event has no banner' do
      it 'does not call S3BucketService' do
        event = create(:event, brand: brand, banner: nil)
        expect(S3BucketService).not_to receive(:new)

        event.destroy
      end
    end
  end
end
