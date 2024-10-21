'use client';

import { Button } from '@/lib/shadcn/components/button';
import {
  createBillingPortalSession,
  createCheckoutSession,
  getSubscriptionStatus,
} from '@/modules/subscription/presentation/actions';
import { useEffect, useState } from 'react';

const StripeButton = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  useEffect(() => {
    (async () => {
      const isSubscribed = await getSubscriptionStatus();
      setIsSubscribed(isSubscribed);
    })();
  }, []);

  const handleClick = async () => {
    if (!isSubscribed) {
      await createCheckoutSession();
    } else {
      await createBillingPortalSession();
    }
  };
  return (
    <Button variant={'outline'} size="lg" onClick={handleClick}>
      {isSubscribed ? 'Manage Subscription' : 'Upgrade Plan'}
    </Button>
  );
};

export default StripeButton;
