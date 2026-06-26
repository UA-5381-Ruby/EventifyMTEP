import { Card } from '@/components/ui';
import { Container, PageWrapper } from '@/components/layout';
import { OFFERINGS } from '@/constants/about.constants';

export function AboutPage() {
  return (
    <PageWrapper>
      <div className="bg-white min-h-screen py-16 sm:py-24">
        <Container className="max-w-5xl">
          <div className="text-center mb-20 sm:mb-28">
            <h2
              id="about-heading"
              className="text-sm font-bold tracking-widest text-primary-600 uppercase mb-6"
            >
              About Eventify
            </h2>

            <h1 className="mb-6 text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight leading-tight">
              Organizing events should feel <br className="hidden sm:block" />
              exciting, not overwhelming.
            </h1>

            <div className="mx-auto max-w-3xl space-y-5 text-lg text-neutral-500 leading-relaxed">
              <p>
                We created Eventify to help brands and communities manage events in one place: from
                publishing and registration to ticket distribution and participant feedback.
              </p>
              <p>
                Our platform is built to support multiple organizations while keeping every brand
                independent, secure, and customizable. Whether you're hosting concerts, meetups,
                lectures, workshops, or community gatherings — Eventify gives you the tools to
                create smooth experiences.
              </p>
            </div>
          </div>

          <section aria-labelledby="offerings-heading" className="mb-24">
            <div className="text-center mb-12">
              <h2 id="offerings-heading" className="text-3xl font-bold text-neutral-900">
                What we offer
              </h2>
            </div>

            <div className="mx-auto max-w-4xl">
              <ul className="grid gap-4 sm:grid-cols-2 lg:gap-6">
                {OFFERINGS.map(({ icon: Icon, label }) => (
                  <li key={label}>
                    <Card variant="bordered" className="transition-colors hover:bg-neutral-50/50">
                      <div className="flex items-center gap-5 p-5 sm:p-6">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                          <Icon className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
                        </span>
                        <span className="text-base font-medium text-neutral-800 leading-snug">
                          {label}
                        </span>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section aria-labelledby="mission-heading">
            <Card variant="elevated" className="overflow-hidden">
              <div className="bg-neutral-50 p-10 sm:p-16 text-center">
                <h2
                  id="mission-heading"
                  className="text-sm font-bold tracking-widest text-primary-600 uppercase mb-6"
                >
                  Our mission
                </h2>

                <p className="mx-auto max-w-2xl text-xl sm:text-2xl leading-relaxed text-neutral-700 font-medium mb-8">
                  "To make event management simpler, more scalable, and more enjoyable for everyone
                  involved."
                </p>

                <div className="inline-block border-t border-neutral-200 pt-6">
                  <p className="text-lg font-bold text-neutral-900">
                    Create events. Connect people. Build experiences.
                  </p>
                </div>
              </div>
            </Card>
          </section>
        </Container>
      </div>
    </PageWrapper>
  );
}
