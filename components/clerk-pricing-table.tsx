"use client";

import { IconLoader2 } from "@tabler/icons-react";
import dynamic from "next/dynamic";

const PricingTableNoSSR = dynamic(
  () => import("@clerk/nextjs").then((c) => c.PricingTable),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-6 h-48 items-center justify-center">
        <IconLoader2 className="size-8 animate-spin" />
      </div>
    ),
  },
);

export default function ClerkPricingTable() {
  return (
    <div
      className="flex flex-col gap-6 w-full justify-between"
      suppressHydrationWarning
      id="pricing"
    >
      <div className="flex justify-start flex-col my-6">
        <h3 className="font-medium text-3xl">
          Choose a plan that suits your need.
        </h3>
        <p className="text-sm text-neutral-500">
          Start for free. Pay as you go.
        </p>
      </div>
      <PricingTableNoSSR
        appearance={{
          elements: {
            pricingTableCard: "!shadow-md",
            pricingTableCardFeatures: "!border-none",
            pricingTableCardFooter: "!border-none",
          },
        }}
      />
    </div>
  );
}
