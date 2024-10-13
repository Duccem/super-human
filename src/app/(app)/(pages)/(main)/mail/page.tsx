import Mail from '@/app/(app)/components/mail/mail';
import { ThemeToggle } from '@/app/(app)/components/shared/theme-toggle';

export default function MailPage() {
  return (
    <>
      <div className="absolute bottom-4 left-4">
        <ThemeToggle />
      </div>
      <Mail navCollapsedSize={4} defaultLayout={[20, 32, 48]} defaultCollapsed={false} />
    </>
  );
}
