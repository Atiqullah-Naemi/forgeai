"use client";

import { FieldGroup } from "./ui/field";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "./ui/textarea";
import { useRef, useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  IconArrowUp,
  IconLoader2,
  IconPaperclip,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { Button } from "./ui/button";
import Image from "next/image";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { DEFAULT_PROMPTS } from "@/constants";
import { fetchRealtimeSubscriptionToken } from "@/app/actions/get-inngest-sub-token";
import { useInngestSubscription } from "@inngest/realtime/hooks";
import { useClerk, Protect } from "@clerk/nextjs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckoutButton } from "@clerk/nextjs/experimental";

interface Props {
  projectId?: string;
}

const messageSchema = z.object({
  message: z
    .string()
    .min(3, "Message is required")
    .max(1000, "Message is too long"),
});

export const AIChatbox = ({ projectId }: Props) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });
  const clerk = useClerk();

  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const { startUpload, isUploading } = useUploadThing("designImageUploader");

  const fileRef = useRef<HTMLInputElement | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notificationsEnabled = Boolean(projectId);

  const { latestData } = useInngestSubscription({
    refreshToken: notificationsEnabled
      ? () => fetchRealtimeSubscriptionToken(projectId!)
      : undefined,
  });

  useEffect(() => {
    const message = latestData?.data;

    if (!message) return;

    setStatus(message);

    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

    if (message === "Demo is ready") {
      router.refresh();

      clearTimerRef.current = setTimeout(() => setStatus(null), 5000);
    }

    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, [latestData?.data, router]);

  const onSubmit = async ({ message }: z.infer<typeof messageSchema>) => {
    const cleanMessage = message.trim() ?? "";

    try {
      if (!cleanMessage && attachedFile) {
        toast.error("Type a message or upload an image");
        return;
      }

      const files = [attachedFile as File];

      let url = undefined;

      if (attachedFile) {
        const res = await startUpload(files);

        url = res?.[0]?.ufsUrl;
      }

      if (!clerk.isSignedIn) {
        clerk.openSignIn();
        return;
      }

      if (!projectId) {
        const res = await apiClient.projects.post({ message, imageUrl: url });

        if (res.data?.id) {
          router.push(`/projects/${res.data.id}`);
          return;
        }
      }

      await apiClient.messages.post({
        message: cleanMessage,
        projectId,
        imageUrl: url,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      form.reset();
      setAttachedFile(null);
      setImagePreview("");
      router.refresh();
    }
  };

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] as File;

    if (!file.type.startsWith("image/")) {
      toast.error("Only images upload are supported");
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImagePreview(reader.result as string);
    };

    reader.readAsDataURL(file);

    setImagePreview(reader.result as string);
    setAttachedFile(file);
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      await form.handleSubmit(onSubmit)(e);

      form.reset();
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    setImagePreview("");
  };

  const onSelect = (message: string) => {
    form.setValue("message", message, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="mx-auto flex flex-col w-full gap-4">
      <div className="relative z-10 flex flex-col w-full mx-auto content-center">
        {status && (
          <div className="font-medium text-sm px-2 py-6 shimmer-text tracking-wider">
            {status}
          </div>
        )}
        <form
          className="overflow-visible rounded-xl border p-2 bg-white
        border-neutral-200 focus-within:border-neutral-200"
          id="message-form"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {imagePreview && attachedFile && (
            <div className="relative flex items-center w-fit gap-2 mb-2 overflow-hidden">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <Image
                  alt={attachedFile.name}
                  src={imagePreview}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                className="absolute z-10 rounded-full shadow-2xl right-0 top-0 bg-[#f7f4ee] p-1 cursor-pointer"
                type="button"
                onClick={removeFile}
              >
                <IconX size={16} />
              </button>
            </div>
          )}
          <FieldGroup>
            <Controller
              name="message"
              control={form.control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  className="max-h-50 min-h-16 resize-none rounded-none border-none bg-transparent! 
                  p-0 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0"
                  placeholder="Ask forge ai"
                  onKeyDown={handleKeyDown}
                />
              )}
            />
          </FieldGroup>

          <div className="flex items-center gap-1">
            <div className="flex items-end gap-0.5 sm:gap-1">
              <input
                type="file"
                className="sr-only"
                onChange={handleSelectFile}
                ref={fileRef}
              />

              <DropdownMenu>
                <DropdownMenuTrigger
                  className="-ml-0.5 h-7 w-7 rounded-md cursor-pointer"
                  type="button"
                  suppressHydrationWarning
                >
                  <IconPlus size={16} />
                </DropdownMenuTrigger>

                <DropdownMenuContent className="space-y-1">
                  <Protect
                    feature="screenshot_upload"
                    fallback={
                      <DropdownMenuItem
                        className="rounded-[calc(1rem-6px)] text-xs"
                        onClick={() => setIsOpen(true)}
                      >
                        <div className="flex items-center gap-2 cursor-pointer">
                          <IconPaperclip
                            className="text-muted-foreground"
                            size={16}
                          />
                          <span>Attach file</span>
                        </div>
                      </DropdownMenuItem>
                    }
                  >
                    <DropdownMenuItem
                      className="rounded-[calc(1rem-6px)] text-xs"
                      onClick={() => fileRef.current?.click()}
                    >
                      <div className="flex items-center gap-2 cursor-pointer">
                        <IconPaperclip
                          className="text-muted-foreground"
                          size={16}
                        />
                        <span>Attach file</span>
                      </div>
                    </DropdownMenuItem>
                  </Protect>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
              <Button
                className="h-7 w-7 rounded-full shadow-lg cursor-pointer"
                size="icon"
                type="submit"
                variant="default"
                form="message-form"
                disabled={
                  form.formState.isSubmitting ||
                  isUploading ||
                  !form.formState.isValid
                }
              >
                {form.formState.isSubmitting || isUploading ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  <IconArrowUp size={16} className="text-white" />
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {!projectId && (
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl">
          {DEFAULT_PROMPTS.map((p) => (
            <Button
              key={p.title}
              onClick={() => onSelect(p.prompt)}
              variant="outline"
              className="cursor-pointer"
            >
              {p.emoji} {p.title}
            </Button>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrad to pro</DialogTitle>
            <DialogDescription>
              Upgrad to pro to access screenshot upload and inline code edit
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <CheckoutButton
              planId="cplan_38YBTL0vjqUlBGtbOBiNJYpRskb"
              planPeriod="month"
            >
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white"
              >
                Upgrad to pro
              </Button>
            </CheckoutButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
