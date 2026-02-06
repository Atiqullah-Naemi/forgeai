import { ProjectView } from "@/components/project-view";
import { getApiClient } from "@/lib/api-client";
import { headers } from "next/headers";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const requestHeaders = await headers();

  const apiClient = getApiClient(requestHeaders);

  const { data } = await apiClient.messages.get({ query: { projectId: id } });

  return <ProjectView projectId={id} initialMessages={data} />;
}
