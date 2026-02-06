"use client";

import { CodeFragment, Message } from "@/lib/generated/prisma/client";
import { MessageCard } from "./message-card";
import { AIChatbox } from "./ai-chatbox";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { IconArrowBack } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface Props {
  projectId?: string;
  initialMessages?: (Message & { codeFragment: CodeFragment | null })[] | null;
  activeCodeFragment?: CodeFragment | null;
  setActiveCodeFragment?: (activeCodeFragment: CodeFragment | null) => void;
}

export function MessagesContainer({
  projectId,
  initialMessages,
  activeCodeFragment,
  setActiveCodeFragment,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    const lastMessage = initialMessages?.findLast(
      (msg) => msg.role === "ASSISTANT",
    );

    if (lastMessage) {
      setActiveCodeFragment?.(lastMessage.codeFragment);
    }
  }, [initialMessages, setActiveCodeFragment]);

  return (
    <div className="flex flex-1 flex-col justify-between overflow-hidden min-h-0 h-full">
      <div className="w-full h-10 flex flex-wrap items-center gap-6 bg-white p-1 px-6">
        <Link
          className="relative w-8 h-8 bg-white rounded-full shadow-sm"
          href="/"
        >
          <Image
            src="/logo.svg"
            alt="forgeai logo"
            fill
            className="object-contain p-1"
          />
        </Link>

        <button
          className="bg-none border-none cursor-pointer"
          onClick={() => router.back()}
        >
          <IconArrowBack />
        </button>
      </div>
      <div
        className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-forground/20
        scrollbar-track-transparent"
      >
        <div className="pt-2 pr-1 w-full">
          {initialMessages?.map((message) => (
            <MessageCard
              key={message.id}
              content={message.content}
              createdAt={message.createdAt}
              role={message.role}
              type={message.type}
              codeFragment={message.codeFragment}
              isActiveCodeFragment={
                activeCodeFragment?.id === message.codeFragment?.id
              }
              onCodeFragmentClick={() => {
                setActiveCodeFragment?.(message.codeFragment);
              }}
              imageUrl={message.imageUrl as string}
            />
          ))}
        </div>
      </div>
      <div className="relative p-3">
        <AIChatbox projectId={projectId} />
      </div>
    </div>
  );
}
