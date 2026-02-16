import { useState } from 'react';
import { Container } from '../ui/Container';

const faqs = [
  {
    question: "Is SepuhIUP officially affiliated with ITB?",
    answer:
      "SepuhIUP is built by IUP ITB students and alumni, but it is an independent preparation platform and not an official product of ITB.",
  },
  {
    question: "Do I need strong English skills before starting?",
    answer:
      "Not yet. SepuhIUP helps you build exam-specific English proficiency through explanations, question wording, and practice in context.",
  },
  {
    question: "Can I access the platform from mobile?",
    answer:
      "Yes. The simulation dashboard is responsive, so you can review questions and explanations from your phone or tablet.",
  },
  {
    question: "What if I am targeting the next intake, not this year?",
    answer:
      "You can start with concept-building modules and low-stress simulations now, then switch to full exam-mode closer to your exam window.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 md:py-24 bg-white">
      <Container>
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4">
            Frequently Asked Questions.
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
            Still unsure about how SepuhIUP fits your IUP ITB journey? These
            answers might help.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="border border-brand-light rounded-xl bg-brand-light/40"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between px-4 md:px-6 py-4 md:py-5 text-left"
                >
                  <span className="text-sm md:text-base font-medium text-brand-dark">
                    {faq.question}
                  </span>
                  <span className="ml-4 text-brand-primary text-xl leading-none">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 md:px-6 pb-4 md:pb-5 pt-0 text-sm md:text-base text-slate-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

