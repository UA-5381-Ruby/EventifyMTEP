import { Link } from "react-router-dom";
import { Badge } from '@/components/ui';
import { Container, PageWrapper } from '@/components/layout';

export function PrivacyPage() {
  return (
    <PageWrapper>
      <div className="bg-white min-h-screen py-16 sm:py-24">
        <Container className="max-w-3xl">
          <div className="mb-12 sm:mb-16 border-b border-neutral-200 pb-10">
            <Badge variant="default" className="mb-6 text-neutral-600">
              Last updated: June 2026
            </Badge>

            <h1 className="mb-6 text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Privacy Policy
            </h1>

            <div className="space-y-4 text-lg text-neutral-600 leading-relaxed">
              <p>
                Eventify respects your privacy and is committed to protecting the personal data you
                share with us. This Privacy Policy describes how we collect, use, store, and
                safeguard your information when you use our platform.
              </p>
              <p className="font-medium text-neutral-900">
                By using Eventify, you agree to the practices described in this policy.
              </p>
            </div>
          </div>

          <div className="space-y-10 text-[15px] sm:text-base text-neutral-700 leading-relaxed">
            <section aria-labelledby="information-we-collect">
              <h2
                id="information-we-collect"
                className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4"
              >
                1. Information We Collect
              </h2>
              <p>
                We collect information necessary to provide and improve our services. This includes
                account data such as your name, email address, and authentication credentials, as
                well as profile and role information specific to the brand or tenant you interact
                with. We also gather event-related activity, encompassing your registrations,
                tickets, and participation history, alongside user-generated content like reviews
                and ratings. Furthermore, we automatically collect technical data, including your IP
                address, device type, browser information, and usage logs, along with
                system-generated identifiers essential for maintaining active sessions and overall
                platform security.
              </p>
            </section>

            <section aria-labelledby="how-we-use-information">
              <h2
                id="how-we-use-information"
                className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4"
              >
                2. How We Use Your Information
              </h2>
              <p>
                We utilize the collected data to actively operate and enhance the Eventify platform.
                This involves providing seamless access to our features, securely managing user
                authentication and active sessions, and efficiently processing event registrations
                to generate tickets. Your information is also crucial for enforcing strict
                role-based access control within each specific brand. Beyond functional operations,
                we rely on this data to continuously improve system performance, stability, and the
                overall user experience, while proactively detecting and preventing fraud, abuse,
                and unauthorized access. Additionally, we maintain comprehensive audit logs to
                ensure ongoing security and operational monitoring.
              </p>
            </section>

            <section aria-labelledby="data-sharing">
              <h2 id="data-sharing" className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                3. Data Sharing and Disclosure
              </h2>
              <p>
                Eventify does not sell or rent your personal data to third parties under any
                circumstances. We adhere to strict data sharing practices, limiting disclosure to
                specific and necessary scenarios. Information may be shared directly with the
                specific brand or tenant you choose to interact with on our platform. We may also
                disclose data when explicitly required by applicable law or formal legal processes.
                Furthermore, limited information may be shared with trusted service providers who
                support our platform's infrastructure, strictly under binding confidentiality
                agreements that ensure your data remains protected.
              </p>
            </section>

            <section aria-labelledby="data-security">
              <h2
                id="data-security"
                className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4"
              >
                4. Data Security and Isolation
              </h2>
              <p>
                We implement robust technical and organizational measures designed to protect your
                user data against unauthorized access, alteration, or accidental loss. A core
                architectural principle of Eventify is strict multi-tenant isolation. Each brand
                operates in a logically separated and secure environment. This structural design
                guarantees that users can only access data belonging directly to their own
                organization, while any cross-brand data access is strictly and automatically
                blocked at the backend level. To further ensure this isolation, every API request is
                rigorously validated against its specific brand context before processing is
                allowed.
              </p>
            </section>

            <section aria-labelledby="your-rights">
              <h2 id="your-rights" className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                5. Your Rights
              </h2>
              <p>
                Depending on your jurisdiction, you may have rights regarding your personal data,
                including access, correction, deletion, and restriction of processing. You may also
                request clarification on how your data is used within the platform.
              </p>
            </section>

            <section aria-labelledby="data-retention">
              <h2
                id="data-retention"
                className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4"
              >
                6. Data Retention
              </h2>
              <p>
                We retain personal data only for as long as it is necessary to provide services,
                comply with legal obligations, resolve disputes, and enforce agreements. When data
                is no longer required, it is securely deleted or anonymized according to industry
                standards.
              </p>
            </section>

            <section aria-labelledby="data-usage-context">
              <h2
                id="data-usage-context"
                className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4"
              >
                7. Example of Data Usage Context
              </h2>
              <p>
                To further clarify how data is scoped and protected within Eventify, consider our
                fundamental operational rules. Every single action performed by a user on the
                platform is permanently associated with a specific brand. When data is requested,
                all database queries are automatically filtered by this brand context before
                returning any results to the user. Similarly, our system logs and analytical data
                are meticulously separated per tenant to ensure complete operational isolation. This
                comprehensive design methodology ensures that data never leaks between organizations
                and remains fully isolated at every layer of the system architecture.
              </p>
            </section>

            <div className="mt-16 rounded-2xl bg-neutral-50 p-8 sm:p-10 text-center">
              <h2 className="text-xl font-bold text-neutral-900 mb-3">8. Contact</h2>
              <p className="mb-6 text-neutral-600">
                If you have any questions about this Privacy Policy or how your data is handled, you
                may{' '}
                <Link
                  to="/contact"
                  className="font-semibold text-primary-600 hover:text-primary-700 hover:underline underline-offset-4 transition-colors"
                >
                  contact the Eventify support team
                </Link>
                .
              </p>
              <p className="text-sm font-medium text-neutral-500">
                By continuing to use Eventify, you acknowledge that you have read and understood
                this Privacy Policy.
              </p>
            </div>
          </div>
        </Container>
      </div>
    </PageWrapper>
  );
}
