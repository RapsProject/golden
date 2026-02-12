import { Container } from '../ui/Container';
import { Button } from '../ui/Button';

interface ComingSoonProps {
  onBackToLanding?: () => void;
}

export function ComingSoon({ onBackToLanding }: ComingSoonProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-brand-light to-white flex flex-col">
      <main className="flex-1 flex items-center">
        <Container>
          <div className="max-w-2xl mx-auto text-center py-24 md:py-32">
            <p className="text-sm font-semibold tracking-wide text-brand-primary uppercase mb-4">
              Coming Soon
            </p>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-dark mb-4">
              We&apos;re finalizing the GoldenPath platform experience.
            </h1>
            <p className="text-base md:text-lg text-slate-600 mb-8">
              The full simulation dashboard, payment, and login system are almost ready. For now, you can
              explore the preview of the IUP ITB preparation journey on this landing page.
            </p>

            {onBackToLanding && (
              <Button
                variant="primary"
                size="md"
                onClick={onBackToLanding}
              >
                Back to Landing Page
              </Button>
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}

