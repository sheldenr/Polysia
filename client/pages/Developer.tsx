import Layout from "@/components/Layout";

export default function Developer() {
  return (
    <Layout>
      <section className="min-h-[70vh] px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-heading tracking-tight text-foreground sm:text-5xl">
            Developer Note
          </h1>
          <p className="mt-3 text-muted-foreground">
            A quick note from Shelden.
          </p>

          <div className="mt-8 rounded-3xl border bg-card p-6 sm:p-8">
            <p className="text-base leading-relaxed text-foreground/90 sm:text-lg">
              I built Polysia because I wanted a language learning tool that actually feels practical. I realized somewhere along my 1000+ Duolingo streak that,
              traditional language learning apps are just not doing it right.
              It really does seem like the only way to learn is to have a friend, or a tutor or surround
              yourself in the environment. I wanted to bridge that gap for people who study online like myself and want to 
              actually learn a language to their own needs that adapts to them.
            </p>
            <p className="mt-4 text-base leading-relaxed text-foreground/90 sm:text-lg">
              Polysia is a solo hobby project, and I’m shaping it with your feedback as I go to make improvements. Please do reach out to me with any thoughts or suggestions, it truly does mean a lot.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
