import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the Story Hub work?",
    answer:
      "Our Story Hub contains a curated library of hand-crafted Chinese stories graded by HSK level. Each story includes synchronized audio, instant dictionary lookups, and the ability to toggle pinyin on or off.",
  },
  {
    question: "What is Integrated SRS?",
    answer:
      "SRS stands for Spaced Repetition System. In Polysia, you can highlight any word or phrase in a story and instantly add it to your daily review deck. Our system then schedules these words for review at optimal intervals to ensure long-term retention.",
  },
  {
    question: "Can I use Polysia for HSK exam prep?",
    answer:
      "Yes! Our content is specifically mapped to the HSK 3.0 curriculum. We provide stories and grammar references for all levels, allowing you to master the exact vocabulary and structures required for your proficiency goals.",
  },
  {
    question: "How does the AI Roleplay feature work?",
    answer:
      "The AI Roleplay feature lets you practice real-world conversations—like ordering food or checking into a hotel—with an AI partner. The AI understands your current HSK level and provides feedback to help you improve your speaking and listening.",
  },
  {
    question: "Is there a free version?",
    answer:
      "You can start for free and access a selection of sample stories and introductory content. To unlock the full library, advanced SRS features, and unlimited AI roleplay, you can upgrade to a Pro or Lifetime plan.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="w-full bg-white dark:bg-background px-6 pb-24 sm:pb-32 pt-24 sm:pt-32 relative">
      {/* Full-width top divider */}
      <div className="absolute top-0 left-0 w-full h-px bg-zinc-200 dark:bg-white/10" />
      
      <div className="mx-auto max-w-3xl relative z-10">
        {/* Top: Heading and Subtext */}
        <div className="w-full text-left mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-semibold tracking-tight text-foreground mb-4">
            Frequently Asked <br />
            questions
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
            Everything you need to know about Polysia and <br />
            how it helps you master Chinese.
          </p>
        </div>

        {/* Bottom: Accordion with Dividers */}
        <div className="w-full">
          <Accordion type="single" collapsible className="w-full border-none rounded-none overflow-visible">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-zinc-200 dark:border-white/10 bg-transparent rounded-none transition-colors duration-200 hover:bg-zinc-50/50 dark:hover:bg-white/[0.02]"
              >
                <AccordionTrigger className="px-0 py-5 text-lg text-foreground hover:no-underline hover:text-primary transition-all duration-200 group-data-[state=open]:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-6 text-foreground/70 leading-relaxed text-sm">
                  <div className="max-w-lg">
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
