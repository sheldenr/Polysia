import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Polysia?",
    answer:
      "Polysia is a premium Chinese learning platform that combines AI-powered roleplay, smart reading tools, and spaced repetition vocabulary building to help you master Mandarin effectively.",
  },
  {
    question: "Is Polysia suitable for beginners?",
    answer:
      "Absolutely! Polysia is designed for learners at all levels. Our reading tools and AI roleplay sessions can be adjusted to match your current proficiency, from absolute beginner to advanced.",
  },
  {
    question: "How does the AI Roleplay work?",
    answer:
      "The AI Roleplay feature allows you to practice realistic Mandarin conversations in various scenarios. It provides instant feedback, suggests improvements, and helps you build confidence in speaking and listening.",
  },
  {
    question: "How can I get started with Polysia?",
    answer:
      "You can start your Mandarin journey by choosing between our monthly Pro plan for ongoing access or our Lifetime plan for a one-time investment. Both plans offer full access to all our AI-powered features.",
  },
  {
    question: "What makes Polysia different from other apps?",
    answer:
      "Unlike many apps that focus on repetitive drills, Polysia emphasizes contextual learning. Our smart reading tool and AI roleplay simulate real-world usage, ensuring that what you learn is immediately applicable.",
  },
];

export default function FAQSection() {
  return (
    <section className="w-full bg-background px-6 pb-24 sm:pb-32 pt-24 sm:pt-32 relative">
      {/* Full-width top divider */}
      <div className="absolute top-0 left-0 w-full h-px bg-zinc-200 dark:bg-white/10" />
      
      <div className="mx-auto max-w-6xl flex flex-col lg:flex-row gap-12 lg:gap-24 relative z-10">
        {/* Left Side: Heading and Subtext */}
        <div className="w-full lg:w-1/3">
          <h2 className="text-3xl font-heading text-foreground sm:text-4xl mb-4 leading-tight">
            Frequently Asked{" "}
            <span className="italic-serif block text-primary">questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Polysia and how it helps you master Chinese.
          </p>
        </div>

        {/* Right Side: Accordion with Dividers */}
        <div className="w-full lg:w-2/3">
          <Accordion type="single" collapsible className="w-full border-none rounded-none overflow-visible">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-zinc-200 dark:border-white/10 bg-transparent rounded-none transition-colors duration-200 hover:bg-zinc-50/50 dark:hover:bg-white/[0.02]"
              >
                <AccordionTrigger className="px-0 py-6 text-xl text-foreground hover:no-underline hover:text-primary transition-all duration-200 group-data-[state=open]:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-8 text-foreground/70 leading-relaxed text-[16px]">
                  <div className="max-w-xl">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
