import Layout from "@/components/Layout";

export default function Contact() {
  return (
    <Layout>
      <section className="px-6 py-20 sm:py-24 transition-colors duration-300">
        <article className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-heading font-semibold tracking-tight text-foreground">
              Contact
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-xl">
              Questions, feedback, or partnership ideas. We'd love to hear from
              you and help you on your Mandarin journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16 border-t border-border pt-12">
            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                General enquiries
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                For anything product-related: bugs, feature requests, feedback,
                or just to say hi, email us at{" "}
                <a
                  className="text-primary hover:underline font-medium"
                  href="mailto:hello@polysia.app"
                >
                  hello@polysia.app
                </a>
                . We aim to reply within 48 hours.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                Open source
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Polysia is developed in the open. You can follow the project,
                file issues, or contribute on{" "}
                <a
                  className="text-primary hover:underline font-medium"
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
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                Partnerships & press
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Interested in collaborating, writing about Polysia, or exploring
                a partnership? Reach out at{" "}
                <a
                  className="text-primary hover:underline font-medium"
                  href="mailto:hello@polysia.app"
                >
                  hello@polysia.app
                </a>{" "}
                with a brief introduction.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                Privacy & legal
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                For data requests, account deletion, or legal matters, please
                email{" "}
                <a
                  className="text-primary hover:underline font-medium"
                  href="mailto:hello@polysia.app"
                >
                  hello@polysia.app
                </a>{" "}
                with the subject line "Privacy Request" or "Legal".
              </p>
            </div>

            <div className="md:col-span-2 p-8 rounded-3xl bg-muted/30 border border-border">
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                Global Support
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                As a global community, we strive to support learners from all time zones. 
                While our primary language for support is English, we'll do our best to 
                help you in Mandarin or any other language via translation tools.
              </p>
            </div>
          </div>
        </article>
      </section>
    </Layout>
  );
}
