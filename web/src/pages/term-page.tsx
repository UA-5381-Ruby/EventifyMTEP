import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui';
import { Container, PageWrapper } from '@/components/layout';

export function TermsPage() {
  return (
    <PageWrapper>
      <div className="bg-white min-h-screen py-16 sm:py-24">
        <Container className="max-w-3xl">
          <div className="mb-12 sm:mb-16 border-b border-neutral-200 pb-10">
            <Badge variant="default" className="mb-6 text-neutral-600">
              Last updated: June 2026
            </Badge>

            <h1 className="mb-6 text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Terms of Use
            </h1>

            <div className="space-y-4 text-lg text-neutral-600 leading-relaxed">
              <p className="font-medium text-neutral-900">Welcome to Eventify.</p>
              <p>
                By accessing or using our platform, you agree to be bound by these Terms of Use. If
                you do not agree, you should not use the service.
              </p>
            </div>
          </div>

          <div className="space-y-12 text-[15px] sm:text-base text-neutral-700 leading-relaxed">
            <section aria-labelledby="platform-overview">
              <h2
                id="platform-overview"
                className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4"
              >
                1. Platform Overview
              </h2>
              <p className="mb-3">
                Eventify is a multi-tenant SaaS platform that allows organizations (brands) to
                create and manage events, and users to register, receive tickets, and leave reviews.
              </p>
              <p>Each organization operates independently within the system.</p>
            </section>

            <section aria-labelledby="user-accounts">
              <h2
                id="user-accounts"
                className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4"
              >
                2. User Accounts
              </h2>
              <p className="mb-4">
                To use Eventify, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-neutral-600 marker:text-neutral-400">
                <li>maintaining the confidentiality of your credentials</li>
                <li>all activities performed under your account</li>
                <li>providing accurate and up-to-date information</li>
              </ul>
              <p className="font-medium text-neutral-900">
                We reserve the right to suspend or terminate accounts that violate these Terms.
              </p>
            </section>

            <section aria-labelledby="roles-and-access">
              <h2
                id="roles-and-access"
                className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4"
              >
                3. Roles and Access
              </h2>
              <p className="mb-4">
                Eventify operates with the following user hierarchy and permissions:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-3 text-neutral-600 marker:text-neutral-400">
                <li>
                  <strong className="text-neutral-900">System Admin (admin)</strong> – possesses
                  unrestricted global access to manage the entire platform, including all users,
                  brands, and system configurations.
                </li>
                <li>
                  <strong className="text-neutral-900">Owner</strong> – the creator of a specific
                  brand (tenant). The Owner holds ultimate administrative control over their brand
                  and has the authority to appoint Managers.
                </li>
                <li>
                  <strong className="text-neutral-900">Manager</strong> – appointed by the Owner to
                  oversee day-to-day operations, create events, and manage content specifically
                  within their assigned brand.
                </li>
                <li>
                  <strong className="text-neutral-900">Member</strong> – a general user who can
                  browse active events, purchase tickets, subscribe to brands, and accept
                  invitations to join specific brands.
                </li>
              </ul>
              <p>
                Access to features and data is strictly limited by your assigned role and brand
                context.
              </p>
            </section>

            <section aria-labelledby="events-and-tickets">
              <h2
                id="events-and-tickets"
                className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4"
              >
                4. Events and Tickets
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-neutral-600 marker:text-neutral-400">
                <li>Events must have valid future dates at the time of creation</li>
                <li>Tickets are unique per user per event</li>
                <li>Duplicate registrations are not allowed</li>
                <li>
                  Event organizers (Owners and Managers) are responsible for the accuracy of event
                  details
                </li>
              </ul>
            </section>

            <section aria-labelledby="reviews">
              <h2 id="reviews" className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                5. Reviews
              </h2>
              <p className="mb-4">Users may submit reviews only after participating in an event.</p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-600 marker:text-neutral-400">
                <li>one review per user per event</li>
                <li>ratings must be between 1 and 5 stars</li>
                <li>abusive or inappropriate content may be removed</li>
              </ul>
            </section>

            <section aria-labelledby="multi-tenant-system">
              <h2
                id="multi-tenant-system"
                className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4"
              >
                6. Multi-Tenant System
              </h2>
              <p className="mb-4">Eventify operates under a multi-tenant architecture.</p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-600 marker:text-neutral-400">
                <li>Data is strictly isolated between brands</li>
                <li>Users cannot access or modify data belonging to other brands</li>
                <li>Any attempt to bypass isolation is strictly prohibited</li>
              </ul>
            </section>

            <section aria-labelledby="prohibited-actions">
              <h2
                id="prohibited-actions"
                className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4"
              >
                7. Prohibited Actions
              </h2>
              <p className="mb-4">Users agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-600 marker:text-neutral-400">
                <li>attempt unauthorized access to other accounts or data</li>
                <li>manipulate or exploit the system</li>
                <li>use the platform for illegal activities</li>
                <li>interfere with system security or performance</li>
              </ul>
            </section>

            <section aria-labelledby="data-and-privacy">
              <h2
                id="data-and-privacy"
                className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4"
              >
                8. Data and Privacy
              </h2>
              <p>
                Your use of Eventify is also governed by our Privacy Policy, which explains how we
                collect and process data.
              </p>
            </section>

            <section aria-labelledby="service-availability">
              <h2
                id="service-availability"
                className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4"
              >
                9. Service Availability
              </h2>
              <p>
                We strive to keep Eventify running smoothly but do not guarantee uninterrupted
                access. Maintenance, updates, or unexpected issues may temporarily affect
                availability.
              </p>
            </section>

            <section aria-labelledby="termination">
              <h2 id="termination" className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                10. Termination
              </h2>
              <p>
                We reserve the right to suspend or terminate access to the platform for violations
                of these Terms or for security reasons.
              </p>
            </section>

            <section aria-labelledby="changes-to-terms">
              <h2
                id="changes-to-terms"
                className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4"
              >
                11. Changes to Terms
              </h2>
              <p>
                We may update these Terms from time to time. Continued use of the platform means you
                accept the updated version.
              </p>
            </section>

            <div className="mt-16 rounded-2xl bg-neutral-50 p-8 sm:p-10 text-center">
              <h2 className="text-xl font-bold text-neutral-900 mb-3">12. Contact</h2>
              <p className="text-neutral-600">
                If you have questions about these Terms, please{' '}
                <Link
                  to="/contact"
                  className="font-semibold text-primary-600 hover:text-primary-700 hover:underline underline-offset-4 transition-colors"
                >
                  contact the Eventify support team
                </Link>
                .
              </p>
            </div>
          </div>
        </Container>
      </div>
    </PageWrapper>
  );
}
