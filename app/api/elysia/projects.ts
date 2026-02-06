import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import Elysia from "elysia";
import { z } from "zod";
import { clerkPlugin } from "elysia-clerk";
import { requirePro } from "@/lib/pro-feature";

export const projects = new Elysia({ prefix: "/projects" })
  .use(clerkPlugin())
  .post(
    "/",
    async ({ auth, body, status }) => {
      const { userId } = auth();

      if (!userId) return status(401, { error: "Unauthorized" });

      if (body.imageUrl) {
        await requirePro(auth, status, "screenshot_upload");
      }

      const createdProject = await db.project.create({
        data: {
          name: `Project-${Date.now()}`,
          userId: userId as string,
          messages: {
            create: {
              content: body.message,
              role: "USER",
              type: "RESULT",
              imageUrl: body.imageUrl,
              userId: userId as string,
            },
          },
        },
      });

      await inngest.send({
        name: "code-agent/codeAgent.run",
        data: {
          message: body.message,
          projectId: createdProject.id,
          imageUrl: body.imageUrl,
          userId,
        },
      });

      return createdProject;
    },
    {
      body: z.object({
        message: z
          .string()
          .min(3, "Message is required")
          .max(1000, "Message is too long"),
        imageUrl: z.string().optional(),
      }),
    },
  )
  .get("/", async ({ auth, status }) => {
    const { userId } = auth();

    if (!userId) return status(401, { error: "Unauthorized" });

    const userProjects = await db.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return userProjects;
  });
