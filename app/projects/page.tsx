import { MessagesContainer } from "@/components/messages-container";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { getApiClient } from "@/lib/api-client";
import { headers } from "next/headers";
import Link from "next/link";

export default async function ProjectsPage() {
  const requestHeaders = await headers();

  const apiClient = getApiClient(requestHeaders);

  const { data } = await apiClient.projects.get();

  return (
    <ResizablePanelGroup
      className="h-dvh w-dvw overflow-hidden"
      direction="horizontal"
      id="project-view-layout"
    >
      <ResizablePanel defaultSize={20} minSize={20}>
        <MessagesContainer projectId="dummy id" />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={80} minSize={50}>
        <div className="flex flex-wrap items-center gap-6 p-6">
          {data?.map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id}>
              <Button className="flex items-center justify-center p-6 h-20 text-white cursor-pointer">
                {project.name}
              </Button>
            </Link>
          ))}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
