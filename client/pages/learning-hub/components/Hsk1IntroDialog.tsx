import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Hsk1IntroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss: () => void;
}

const Hsk1IntroDialog = ({ open, onOpenChange, onDismiss }: Hsk1IntroDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(96vw,68rem)] max-h-[92vh] overflow-hidden rounded-xl border bg-card p-0 shadow-2xl">
        <div className="relative border-b bg-gradient-to-br from-primary/10 via-card to-secondary/20 px-6 py-6 sm:px-8 sm:py-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl"
          />
          <DialogHeader className="relative text-left">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Before you begin
            </div>
            <DialogTitle className="text-2xl font-heading leading-tight sm:text-3xl">
              Welcome! A quick primer for HSK 1.
            </DialogTitle>
            <DialogDescription className="max-w-3xl text-sm sm:text-base">
              You picked HSK 1, so you're starting from the beginning. Spend a few minutes with these foundations — they'll make every review, story, and dialogue click much faster.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[calc(92vh-12rem)] overflow-y-auto px-6 py-5 sm:px-8 sm:py-6 custom-scrollbar">
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <section className="rounded-xl border border-border/60 bg-secondary/20 p-4">
              <h3 className="mb-2 font-heading text-base">1. The four tones (+ neutral)</h3>
              <p className="mb-3 text-muted-foreground">
                Mandarin is tonal — the pitch of a syllable changes the word. Practice these out loud:
              </p>
              <ul className="space-y-1.5 text-foreground font-medium">
                <li><span className="font-mono text-emerald-600 dark:text-emerald-400">mā</span> — 1st tone, high & flat (妈 "mom")</li>
                <li><span className="font-mono text-blue-600 dark:text-blue-400">má</span> — 2nd tone, rising (麻 "hemp")</li>
                <li><span className="font-mono text-amber-600 dark:text-amber-400">mǎ</span> — 3rd tone, dip down then up (马 "horse")</li>
                <li><span className="font-mono text-rose-600 dark:text-rose-400">mà</span> — 4th tone, sharp falling (骂 "scold")</li>
                <li><span className="font-mono text-muted-foreground">ma</span> — neutral, flat & short (吗 question particle)</li>
              </ul>
            </section>

            <section className="rounded-xl border border-border/60 bg-secondary/20 p-4">
              <h3 className="mb-2 font-heading text-base">2. Pinyin: The bridge</h3>
              <p className="mb-2 text-muted-foreground">
                Pinyin is the phonetic system using the Latin alphabet. Most sounds are intuitive, but watch out for:
              </p>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="rounded-lg bg-card/50 p-2 border border-border/40">
                  <span className="text-primary font-bold">q</span> like "ch" in cheap
                </div>
                <div className="rounded-lg bg-card/50 p-2 border border-border/40">
                  <span className="text-primary font-bold">x</span> like "sh" in she
                </div>
                <div className="rounded-lg bg-card/50 p-2 border border-border/40">
                  <span className="text-primary font-bold">zh</span> like "j" in jump
                </div>
                <div className="rounded-lg bg-card/50 p-2 border border-border/40">
                  <span className="text-primary font-bold">c</span> like "ts" in cats
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border/60 bg-secondary/20 p-4">
              <h3 className="mb-2 font-heading text-base">3. Basic Sentence Structure</h3>
              <p className="mb-2 text-muted-foreground">
                Good news! Basic Chinese grammar is often "Subject + Verb + Object", just like English.
              </p>
              <div className="space-y-2 rounded-lg bg-card/50 p-3 border border-border/40">
                <p className="text-base">我 <span className="text-primary">喝</span> 咖啡。</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Wǒ hē kāfēi (I drink coffee)</p>
              </div>
            </section>

            <section className="rounded-xl border border-border/60 bg-secondary/20 p-4">
              <h3 className="mb-2 font-heading text-base">4. Characters (Hanzi)</h3>
              <p className="text-muted-foreground">
                Characters represent meanings, not just sounds. You'll learn them through the <strong>Daily Review</strong> system. Don't worry about memorizing everything at once — focus on recognition first!
              </p>
              <p className="mt-4 text-xs text-muted-foreground italic">
                Tip: 10 minutes of practice a day is plenty to start. Consistency is key!
              </p>
            </section>
          </div>
        </div>

        <DialogFooter className="border-t bg-card px-6 py-4 sm:px-8">
          <Button className="w-full rounded-xl sm:w-auto font-bold uppercase tracking-widest text-xs px-8 h-11" onClick={onDismiss}>
            Got it — let's start
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Hsk1IntroDialog;
