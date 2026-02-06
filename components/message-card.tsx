import {
  CodeFragment,
  MessageRole,
  MessageType,
} from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";
import { Card } from "./ui/card";
import { formatDistance } from "date-fns";
import { Button } from "./ui/button";
import { IconChevronRight } from "@tabler/icons-react";
import Image from "next/image";

interface Props {
  content: string;
  createdAt: Date;
  role: MessageRole;
  type: MessageType;
  codeFragment: CodeFragment | null;
  isActiveCodeFragment: boolean;
  onCodeFragmentClick: (codeFragment: CodeFragment) => void;
  imageUrl?: string;
}

export function MessageCard({
  content,
  createdAt,
  role,
  type,
  codeFragment,
  isActiveCodeFragment,
  onCodeFragmentClick,
  imageUrl,
}: Props) {
  if (role === "ASSISTANT") {
    return (
      <div
        className={cn("flex flex-col p-2", type === "ERROR" && "text-rose-500")}
      >
        <div className="flex items-center gap-2 p-2 m-2 break-all">
          {content
            .replaceAll("<task_summary>", "")
            .replace("</task_summary>", "")}
        </div>

        {codeFragment && (
          <Button
            className={cn(
              "bg-[#f7f4ee] w-fit hover:bg-[#f7f4ee] opacity-100 text-primary p-2 h-auto flex justify-between gap-5 m-2 cursor-pointer",
              isActiveCodeFragment &&
                "bg-[#d2dff9] hover:bg-[#d2dff9] border-[#7da1eb]",
            )}
            onClick={() => onCodeFragmentClick(codeFragment)}
          >
            <span className="font-semibold">Code Fragment</span>
            <IconChevronRight />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-end p-2">
      <Card className="rounded-md bg-[#f7f4ee] shadow-none border-none wrap-break-word max-w-[80%] py-2 gap-2">
        {imageUrl && (
          <div className="w-16 h-16 relative">
            <Image src={imageUrl} alt={content} fill className="object-cover" />
          </div>
        )}
        <span className="px-3">{content}</span>

        <span className="text-xs font-medium text-muted-foreground px-3">
          {formatDistance(createdAt, new Date())} ago
        </span>
      </Card>
    </div>
  );
}
