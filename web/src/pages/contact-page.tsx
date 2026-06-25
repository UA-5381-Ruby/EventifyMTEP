import { Button, Input, Textarea, Alert, Card } from '@/components/ui';
import { Container, PageWrapper } from '@/components/layout';
import { CONTACT_DETAILS } from '@/constants/ui.constants';
import { useContactForm } from '@/hooks/useContactForm';

export function ContactPage() {
  const { fields, errors, status, handleChange, handleSubmit } = useContactForm();

  return (
    <PageWrapper>
      <div className="bg-white min-h-screen py-16 sm:py-24">
        <Container className="max-w-5xl">
          <div className="text-center mb-16 sm:mb-20">
            <h1 className="mb-6 text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Get in touch
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-neutral-600 leading-relaxed">
              Have a question or need help with your account? Fill out the form below and our team
              will respond as soon as possible.
            </p>
          </div>

          <div className="grid gap-12 lg:gap-16 lg:grid-cols-5 items-start">
            <aside className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-8">Contact Information</h3>

                <ul className="space-y-8">
                  {CONTACT_DETAILS.map(({ icon: Icon, label, value }) => (
                    <li key={label} className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                        <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{label}</p>
                        <p className="text-sm text-neutral-600 mt-1">{value}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <div className="lg:col-span-3">
              <Card variant="bordered" className="p-6 sm:p-8">
                <div className="space-y-6">
                  {status === 'success' && (
                    <Alert variant="success" title="Message sent!">
                      Thanks for reaching out. We'll get back to you within 24 hours.
                    </Alert>
                  )}

                  {status === 'error' && (
                    <Alert variant="error" title="Something went wrong">
                      We couldn't send your message. Please try again later or email us directly at
                      support@eventify.com.
                    </Alert>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      label="Your name"
                      placeholder="Jane Smith"
                      value={fields.name}
                      onChange={handleChange('name')}
                      error={errors.name}
                    />
                    <Input
                      label="Email address"
                      type="email"
                      placeholder="you@example.com"
                      value={fields.email}
                      onChange={handleChange('email')}
                      error={errors.email}
                    />
                  </div>

                  <Input
                    label="Subject"
                    placeholder="What's this about?"
                    value={fields.subject}
                    onChange={handleChange('subject')}
                    error={errors.subject}
                  />

                  <Textarea
                    label="Message"
                    placeholder="Tell us how we can help..."
                    value={fields.message}
                    onChange={handleChange('message')}
                    error={errors.message}
                  />

                  <div className="pt-2">
                    <Button
                      variant="primary"
                      className="w-full sm:w-auto"
                      isLoading={status === 'loading'}
                      onClick={handleSubmit}
                    >
                      Send message
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </div>
    </PageWrapper>
  );
}
