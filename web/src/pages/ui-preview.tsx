import React, { useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Card,
  Badge,
  Alert,
  Spinner,
  Modal,
  Pagination,
} from '@/components/ui';

import { Container, PageWrapper } from '@/components/layout';

export function UIPreview() {
  const [modalOpen, setModalOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  const [currentPage, setCurrentPage] = useState(3);

  return (
    <PageWrapper>
      <div className="py-12 bg-neutral-50 min-h-screen">
        <Container>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">🎨 Eventify Design System</h1>
          <p className="text-neutral-500 mb-12">UI Component Preview</p>

          {/* ── BUTTONS ── */}
          <Section title="Buttons">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="primary" isLoading>
                Loading
              </Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </Section>

          {/* ── INPUTS ── */}
          <Section title="Inputs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <Input label="Name" placeholder="Enter your name" />
              <Input label="Email" type="email" placeholder="you@example.com" />
              <Input label="Password" type="password" placeholder="••••••••" />
              <Input label="With error" error="This field is required" />
              <Input label="With hint" hint="We won't share this with anyone" />
              <Input label="Disabled" disabled placeholder="Disabled" />
            </div>
          </Section>

          {/* ── TEXTAREA ── */}
          <Section title="Textarea">
            <div className="max-w-lg">
              <Textarea label="Description" placeholder="Describe your event..." />
            </div>
          </Section>

          {/* ── SELECT ── */}
          <Section title="Select">
            <div className="max-w-xs">
              <Select
                label="Category"
                placeholder="Choose category"
                options={[
                  { value: 'music', label: 'Music' },
                  { value: 'tech', label: 'Technology' },
                  { value: 'art', label: 'Art & Culture' },
                  { value: 'sports', label: 'Sports' },
                ]}
              />
            </div>
          </Section>

          {/* ── CHECKBOX ── */}
          <Section title="Checkbox">
            <div className="flex flex-col gap-2">
              <Checkbox
                label="I agree to the terms"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
              <Checkbox label="Disabled checkbox" disabled />
            </div>
          </Section>

          {/* ── CARDS ── */}
          <Section title="Cards">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['default', 'bordered', 'elevated'] as const).map((v) => (
                <Card key={v} variant={v}>
                  <div className="p-5 space-y-4">
                    <h3 className="text-lg font-bold text-neutral-900">Card {v}</h3>
                    <p className="text-sm text-neutral-600">
                      This is a {v} card component for Eventify.
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        Cancel
                      </Button>
                      <Button size="sm">Save</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          {/* ── BADGES ── */}
          <Section title="Badges">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  'default',
                  'primary',
                  'secondary',
                  'success',
                  'warning',
                  'error',
                  'outline',
                ] as const
              ).map((v) => (
                <Badge key={v} variant={v}>
                  {v}
                </Badge>
              ))}
            </div>
          </Section>

          {/* ── ALERTS ── */}
          <Section title="Alerts">
            <div className="flex flex-col gap-3 max-w-lg">
              <Alert variant="info" title="Info">
                Your session will expire in 10 minutes.
              </Alert>
              <Alert variant="success" title="Success">
                Event created successfully!
              </Alert>
              <Alert variant="warning" title="Warning">
                You have unsaved changes.
              </Alert>
              <Alert variant="error" title="Error">
                Failed to submit the form.
              </Alert>
            </div>
          </Section>

          {/* ── SPINNERS ── */}
          <Section title="Spinners">
            <div className="flex items-center gap-6">
              {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
                <Spinner key={s} size={s} />
              ))}
            </div>
          </Section>

          {/* ── MODAL ── */}
          <Section title="Modal">
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Modal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Confirm Action"
              footer={
                <>
                  <Button variant="outline" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setModalOpen(false)}>Confirm</Button>
                </>
              }
            >
              <p className="text-neutral-700">
                Are you sure you want to delete this event? This action cannot be undone.
              </p>
            </Modal>
          </Section>

          {/* ── PAGINATION ── */}
          <Section title="Pagination">
            <div className="max-w-md bg-white p-4 border border-neutral-100 rounded-xl">
              <Pagination
                page={currentPage}
                totalPages={10}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </Section>
        </Container>
      </div>
    </PageWrapper>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-neutral-800 mb-1">{title}</h2>
      <div className="h-0.5 w-12 bg-primary-500 mb-5 rounded-full" />
      {children}
    </section>
  );
}
