import { Container } from '../ui/Container';

const testimonials = [
  {
    name: "Raka Pradipta",
    role: "Systems & Tech, ITB '24",
    quote:
      "We designed these questions based on the actual cognitive patterns that AqTest measures — not just textbook difficulty.",
  },
  {
    name: "Nabila Ayu",
    role: "Industrial Engineering, ITB '23",
    quote:
      "Most students underestimate the English reasoning component. SabiAcademia makes you comfortable thinking in English under time pressure.",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-24 bg-brand-light">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4">
            Insider Access from IUP ITB Students.
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
            SabiAcademia is crafted together with question writers and
            successful IUP ITB students — giving you guidance from people who
            have passed the exam themselves.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {testimonials.map(({ name, role, quote }) => (
            <article
              key={name}
              className="bg-white rounded-2xl border border-brand-light shadow-sm p-6 md:p-8 flex flex-col h-full"
            >
              <p className="text-slate-700 text-sm md:text-base mb-6 italic">
                &ldquo;{quote}&rdquo;
              </p>
              <div className="mt-auto flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-brand-primary/80 text-white flex items-center justify-center text-sm font-semibold">
                  {name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-sm font-semibold text-brand-dark">
                    {name}
                  </div>
                  <div className="text-xs text-slate-500">{role}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

