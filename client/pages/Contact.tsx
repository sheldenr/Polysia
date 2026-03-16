import Layout from "@/components/Layout";

export default function Contact() {
  return (
    <Layout>
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 transition-colors duration-300">
        <article className="max-w-2xl mx-auto">
          <h1 className="text-center text-3xl sm:text-4xl font-bold text-black dark:text-zinc-100">
            Contact
          </h1>
          <p className="mt-3 text-center text-base text-gray-500 dark:text-zinc-400">
            Questions, feedback, or partnership ideas. we'd love to hear from you.
          </p>

          <div className="mt-12 space-y-10 text-base leading-7 text-gray-700 dark:text-zinc-300">
            <div>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-100 mb-3">
                General enquiries
              </h2>
              <p>
                For anything product-related: bugs, feature requests, feedback, or just
                to say hi, email us at{" "}
                <a className="text-[#3491b2] hover:underline" href="mailto:hello@polysia.app">
                  hello@polysia.app
                </a>
                . We aim to reply within a couple of days.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-100 mb-3">
                Partnerships &amp; press
              </h2>
              <p>
                Interested in collaborating, writing about Polysia, or exploring a
                partnership? Reach out at{" "}
                <a className="text-[#3491b2] hover:underline" href="mailto:hello@polysia.app">
                  hello@polysia.app
                </a>{" "}
                with a brief introduction and we'll get back to you.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-100 mb-3">
                Open source
              </h2>
              <p>
                Polysia is developed in the open. You can follow the project, file issues,
                or contribute on{" "}
                <a
                  className="text-[#3491b2] hover:underline"
                  href="https://github.com/sheldenr/polysia"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-100 mb-3">
                Privacy &amp; legal
              </h2>
              <p>
                For data requests, account deletion, or legal matters, please email{" "}
                <a className="text-[#3491b2] hover:underline" href="mailto:hello@polysia.app">
                  hello@polysia.app
                </a>{" "}
                with the subject line <span className="font-medium text-black dark:text-zinc-100">"Privacy Request"</span> or{" "}
                <span className="font-medium text-black dark:text-zinc-100">"Legal"</span> and we'll prioritize your message.
              </p>
            </div>
          </div>
        </article>
      </section>
    </Layout>
  );
}
