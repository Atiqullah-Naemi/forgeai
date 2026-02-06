import { useCallback, useMemo, useState } from "react";
import { TreeView } from "./tree-view";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { getLanguageFromExtension } from "@/lib/utils";
import { CodeView } from "./code-view";
import { Button } from "./ui/button";
import { IconFolders, IconLoader2 } from "@tabler/icons-react";
import { SaveIcon } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { Protect } from "@clerk/nextjs";
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

type FileCollection = Record<string, string>;

interface Props {
  files: FileCollection;
  fragmentId: string;
  projectId: string;
  sandboxId: string;
}

export default function FileExplorer({
  files,
  fragmentId,
  projectId,
  sandboxId,
}: Props) {
  const [selectedFile, setSelectedFile] = useState<string | null>(() => {
    const fileKeys = Object.keys(files);
    return fileKeys.length > 0 ? fileKeys[0] : null;
  });
  const [localFiles, setLocalFiles] = useState<FileCollection>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const mergedFiles = useMemo(
    () => ({ ...files, ...localFiles }),
    [files, localFiles],
  );

  const saveChanges = async () => {
    try {
      setIsLoading(true);

      await apiClient
        .fragments({ fragmentId })
        .patch({ files: localFiles, projectId, sandboxId });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    window.navigator.clipboard.writeText(mergedFiles[selectedFile as string]);
    toast.success("Code copied to clipboard");
  };

  const onSelect = useCallback(
    (filePath: string) => {
      if (mergedFiles[filePath]) {
        setSelectedFile(filePath);
      }
    },
    [mergedFiles],
  );

  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="h-dvh w-dvw overflow-hidden"
      >
        <ResizablePanel defaultSize={20} minSize={20}>
          <TreeView files={mergedFiles} onSelect={onSelect} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80} minSize={50}>
          {selectedFile && mergedFiles[selectedFile] ? (
            <div className="flex flex-col relative w-full h-full">
              <div className="flex items-center justify-end w-full h-8 px-8 gap-6">
                <Button
                  className="p-1 h-5 w-5 border-none rounded-full cursor-pointer"
                  variant="outline"
                  onClick={copyToClipboard}
                >
                  <IconFolders className="size-4" />
                </Button>
                <Protect
                  feature="inline_code_edit"
                  fallback={
                    <Button
                      className="p-1 h-5 w-5 border-none rounded-full cursor-pointer"
                      variant="outline"
                      onClick={() => setIsOpen(true)}
                    >
                      {isLoading ? (
                        <IconLoader2 className="size-4 animate-spin" />
                      ) : (
                        <SaveIcon className="size-4" />
                      )}
                    </Button>
                  }
                >
                  <Button
                    className="p-1 h-5 w-5 border-none rounded-full cursor-pointer"
                    variant="outline"
                    onClick={saveChanges}
                  >
                    {isLoading ? (
                      <IconLoader2 className="size-4 animate-spin" />
                    ) : (
                      <SaveIcon className="size-4" />
                    )}
                  </Button>
                </Protect>
              </div>
              <div className="flex flex-1 overflow-auto h-full w-full">
                <CodeView
                  code={mergedFiles[selectedFile]}
                  lang={getLanguageFromExtension(selectedFile) as string}
                  onChange={(e) => {
                    setLocalFiles((prev) => ({ ...prev, [selectedFile]: e }));
                  }}
                  filePath={selectedFile}
                  localValue={localFiles[selectedFile]}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              Select a file to view its content
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>

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
                className="text-white"
                onClick={() => setIsOpen(false)}
              >
                Upgrad to pro
              </Button>
            </CheckoutButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
