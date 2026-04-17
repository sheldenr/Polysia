import Layout from "@/components/Layout";

export default function Developer() {
  return (
    <Layout>
      <section className="min-h-[70vh] px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-heading tracking-tight text-foreground sm:text-5xl">
            Developer
          </h1>
          <p className="mt-3 text-muted-foreground">
            A quick note from the person building Polysia.
          </p>

          <div className="mt-8 rounded-3xl border bg-card p-6 sm:p-8">
            <p className="text-base leading-relaxed text-foreground/90 sm:text-lg">
              I built Polysia because I wanted a Chinese-learning tool that feels practical every
              day, not just another set of drills. The goal is simple: help people remember useful
              vocabulary, read with confidence, and practice real conversation consistently.
            </p>
            <p className="mt-4 text-base leading-relaxed text-foreground/90 sm:text-lg">
              Polysia is a hands-on solo project, and I’m shaping it with real learner feedback so
              it stays focused on what actually helps.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
