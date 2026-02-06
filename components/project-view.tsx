"use client";

import { CodeFragment, Message } from "@/lib/generated/prisma/client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { IconCode, IconWorld } from "@tabler/icons-react";
import { MessagesContainer } from "./messages-container";
import FileExplorer from "./file-explorer";
import { CodeWebView } from "./code-web-view";

interface Props {
  projectId: string;
  initialMessages: (Message & { codeFragment: CodeFragment | null })[] | null;
}

export function ProjectView({ projectId, initialMessages }: Props) {
  const [activeCodeFragment, setActiveCodeFragment] =
    useState<CodeFragment | null>(null);
  const [tabState, setTabState] = useState<"preview" | "code">("preview");

  return (
    <ResizablePanelGroup
      className="h-dvh w-dvw overflow-hidden"
      direction="horizontal"
      id="project-view-layout"
    >
      <ResizablePanel defaultSize={20} minSize={20}>
        <MessagesContainer
          projectId={projectId}
          initialMessages={initialMessages}
          activeCodeFragment={activeCodeFragment}
          setActiveCodeFragment={setActiveCodeFragment}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={80} minSize={50}>
        <Tabs
          id="projects-tab"
          className="h-full"
          defaultValue="preview"
          value={tabState}
          onValueChange={(value) => setTabState(value)}
        >
          <div className="w-full flex items-center p-2 border-b gap-x-2">
            <TabsList className="h-8 p-0 border min-w-48">
              <TabsTrigger value="preview">
                <IconWorld />
              </TabsTrigger>
              <TabsTrigger value="code">
                <IconCode />
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="preview">
            {!!activeCodeFragment && <CodeWebView data={activeCodeFragment} />}
          </TabsContent>
          <TabsContent value="code">
            <FileExplorer
              files={activeCodeFragment?.files as Record<string, string>}
              fragmentId={activeCodeFragment?.id as string}
              projectId={projectId}
              sandboxId={activeCodeFragment?.sandboxId as string}
            />
          </TabsContent>
        </Tabs>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
