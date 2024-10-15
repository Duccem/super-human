import Mail from '@/app/(app)/components/mail/mail';

export default function MailPage() {
  return (
    <>
      <Mail navCollapsedSize={4} defaultLayout={[20, 32, 48]} defaultCollapsed={false} />
    </>
  );
}
