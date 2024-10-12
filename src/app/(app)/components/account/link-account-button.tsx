'use client'
import { Button } from '@/lib/shadcn/components/button';
import { getAurinkoAuthUrl } from '@/modules/shared/infrastructure/aurinko/aurinko';

const LinkAccountButton = () => {
  return (
    <div>
      <Button onClick={async ()=>{
        const redirectUrl = await getAurinkoAuthUrl('Google');
        console.log(redirectUrl);
        window.location.href = redirectUrl;
      }}>
        Link Account
      </Button>
    </div>
  );
}

export default LinkAccountButton;
