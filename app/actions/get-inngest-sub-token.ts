"use server";

import { inngest } from "@/inngest/client";

import { projectChannel } from "@/inngest/functions";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";

export type ProjectChannelToken = Realtime.Token<
  typeof projectChannel,
  ["projectInfo"]
>;

export async function fetchRealtimeSubscriptionToken(
  projectId: string,
): Promise<ProjectChannelToken> {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const project = await db.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });

  if (!project) throw new Error("Forbidden");

  const token = await getSubscriptionToken(inngest, {
    channel: projectChannel(projectId),
    topics: ["projectInfo"] as const,
  });

  return token;
}
