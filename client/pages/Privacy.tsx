import Layout from "@/components/Layout";

export default function Privacy() {
  return (
    <Layout>
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 transition-colors duration-300">
        <article className="max-w-2xl mx-auto">
          <h1 className="text-center text-3xl sm:text-4xl text-black dark:text-zinc-100">
            Privacy Policy
          </h1>
          <p className="mt-3 text-center text-base text-gray-500 dark:text-zinc-400">
            How we handle your data at Polysia.
          </p>
          <p className="mt-2 text-center text-sm text-gray-400 dark:text-zinc-500">
            Last updated: March 2026
          </p>

          <div className="mt-12 space-y-10 text-base leading-7 text-gray-700 dark:text-zinc-300">
            <div>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-100 mb-3">
                What we collect
              </h2>
              <p>
                When you create an account, we collect your email address and
                any profile information you choose to provide. As you use
                Polysia, we store your learning progress, session history, and
                preferences so we can personalize your experience.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-100 mb-3">
                How we use it
              </h2>
              <p>
                Your data is used solely to operate and improve the service,
                things like powering spaced-repetition schedules, remembering
                your settings, and diagnosing bugs. We may also use anonymized,
                aggregated metrics to understand how people learn so we can make
                Polysia better.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-100 mb-3">
                What we never do
              </h2>
              <p>
                We do not sell, rent, or trade your personal data to third
                parties. We do not use your data to serve you ads. Your learning
                history stays yours.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-100 mb-3">
                Data retention
              </h2>
              <p>
                We retain your data for as long as your account is active. If
                you delete your account, your personal data is removed from our
                systems within 30 days, except where retention is required by
                law.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-100 mb-3">
                Your rights
              </h2>
              <p>
                You can request a copy of your data, ask us to correct
                inaccuracies, or request deletion at any time by emailing{" "}
                <a
                  className="text-[#3491b2] hover:underline"
                  href="mailto:hello@polysia.app"
                >
                  hello@polysia.app
                </a>
                . We'll respond within 30 days.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-100 mb-3">
                Questions
              </h2>
              <p>
                If you have any privacy-related questions or concerns, reach out
                at{" "}
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
