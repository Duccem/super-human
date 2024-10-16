
import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';

const Mail = dynamic(() => import('@/app/(app)/components/mail/mail'), { ssr: false });

export default function MailPage() {
  const layout = cookies().get("react-resizable-panels:layout:mail")
  const collapsed = cookies().get("react-resizable-panels:collapsed")

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined
  return (
    <>
      <Mail navCollapsedSize={4} defaultLayout={defaultLayout} defaultCollapsed={defaultCollapsed} />
    </>
  );
}
