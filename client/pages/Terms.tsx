import Layout from "@/components/Layout";

export default function Terms() {
  return (
    <Layout>
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 transition-colors duration-300">
        <article className="max-w-2xl mx-auto">
          <h1 className="text-center text-3xl sm:text-4xl font-bold text-black dark:text-zinc-100">
            Terms of Service
          </h1>
          <p className="mt-3 text-center text-base text-gray-500 dark:text-zinc-400">
            The basic terms for using Polysia.
          </p>
          <p className="mt-2 text-center text-sm text-gray-400 dark:text-zinc-500">
            Last updated: March 2026
          </p>

          <div className="mt-12 space-y-10 text-base leading-7 text-gray-700 dark:text-zinc-300">
            <div>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-100 mb-3">
                Acceptance
              </h2>
              <p>
                By accessing or using Polysia, you agree to be bound by these
                Terms of Service. If you do not agree, please do not use the
                service.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-100 mb-3">
                Use of the service
              </h2>
              <p>
                Polysia is provided for personal, non-commercial language
                learning. You agree to use the platform in a lawful manner and
                not to attempt to reverse-engineer, scrape, or otherwise misuse
                any part of the service.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-100 mb-3">
                Account responsibilities
              </h2>
              <p>
                You are responsible for keeping your login credentials
                confidential and for all activity that occurs under your
                account. Notify us immediately at{" "}
                <a
                  className="text-[#3491b2] hover:underline"
                  href="mailto:hello@polysia.app"
                >
                  hello@polysia.app
                </a>{" "}
                if you suspect unauthorized access.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-100 mb-3">
                Intellectual property
              </h2>
              <p>
                All content, UI, and branding within Polysia are the property of
                Polysia and its contributors. Your personal learning data
                remains yours, but you grant us a limited license to process it
                to provide the service.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-100 mb-3">
                Limitation of liability
              </h2>
              <p>
                Polysia is provided as-is, without warranties of any kind. We
                are not liable for any indirect, incidental, or consequential
                damages arising from your use of the service. As an alpha-stage
                project, downtime or data loss, however unlikely, may occur.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-100 mb-3">
                Changes to these terms
              </h2>
              <p>
                We may update these terms as the product evolves. We'll make a
                reasonable effort to notify users of significant changes.
                Continued use of Polysia after changes are posted constitutes
                acceptance.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-100 mb-3">
                Contact
              </h2>
              <p>
                Questions about these terms? Email us at{" "}
                <a
                  className="text-[#3491b2] hover:underline"
                  href="mailto:hello@polysia.app"
                >
                  hello@polysia.app
                </a>
                .
              </p>
            </div>
          </div>
        </article>
      </section>
    </Layout>
  );
}
