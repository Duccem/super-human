'use client';
import { MaxInteractions } from '@/modules/chat-interaction/domain/max-interactions';
import { api } from '@/modules/shared/infrastructure/trpc/react';
import { getSubscriptionStatus } from '@/modules/subscription/presentation/actions';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import StripeButton from './stripe-button';

const PremiumBanner = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  useEffect(() => {
    (async () => {
      const subscriptionStatus = await getSubscriptionStatus();
      setIsSubscribed(subscriptionStatus);
    })();
  }, []);

  const { data: chatbotInteraction } = api.interaction.getInteractions.useQuery();
  const remainingCredits = chatbotInteraction?.remainingInteractions || 0;

  if (isSubscribed)
    return (
      <motion.div
        layout
        className="bg-gray-900 relative p-4 rounded-lg border overflow-hidden flex flex-col md:flex-row gap-4"
      >
        <img src="/bot.webp" className="md:absolute md:-bottom-6 md:-right-10 h-[180px] w-auto" />
        <div>
          <h1 className="text-white text-xl font-semibold">Premium Plan</h1>
          <div className="h-2"></div>
          <p className="text-gray-400 text-sm md:max-w-[calc(100%-70px)]">Ask as many questions as you want</p>
          <div className="h-4"></div>
        </div>
      </motion.div>
    );

  return (
    <motion.div
      layout
      className="bg-gray-900 relative p-4 rounded-lg border overflow-hidden flex flex-col md:flex-row gap-4"
    >
      <img src="/bot.webp" className="md:absolute md:-bottom-6 md:-right-10 h-[180px] w-auto" />
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-white text-xl font-semibold">Basic Plan</h1>
          <p className="text-gray-400 text-sm md:max-w-[calc(100%-0px)]">
            {remainingCredits} / {MaxInteractions.MAX_INTERACTIONS} messages remaining
          </p>
        </div>
        <div className="h-4"></div>
        <p className="text-gray-400 text-sm md:max-w-[calc(100%-150px)]">
          Upgrade to pro to ask as many questions as you want
        </p>
        <div className="h-4"></div>
        <StripeButton />
      </div>
    </motion.div>
  );
};

export default PremiumBanner;
