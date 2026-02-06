import { AIChatbox } from "@/components/ai-chatbox";
import ClerkPricingTable from "@/components/clerk-pricing-table";
import { Separator } from "@/components/ui/separator";

export default async function Page() {
  return (
    <div className="my-20 flex flex-col gap-10 w-2xl">
      <div className="flex flex-wrap w-full flex-col gap-6 justify-center items-center">
        <h1 className="font-medium text-4xl text-center">
          Build something greate with Forgeai that work the way you want.
        </h1>

        <p className="text-md text-center">
          By uploading a design image or screenshot or by chatting with AI you
          create a production ready beautifull applications.
        </p>
      </div>

      <AIChatbox />

      <Separator className="my-10" />

      <ClerkPricingTable />
    </div>
  );
}
