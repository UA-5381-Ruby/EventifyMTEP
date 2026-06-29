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
