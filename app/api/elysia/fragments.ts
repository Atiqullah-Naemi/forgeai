import { db } from "@/lib/db";
import { getSandbox, toProjectPath } from "@/lib/sandbox";
import Elysia from "elysia";
import { z } from "zod";
import { clerkPlugin } from "elysia-clerk";
import { requirePro } from "@/lib/pro-feature";

export const fragments = new Elysia({ prefix: "/fragments" })
  .use(clerkPlugin())
  .patch(
    "/:fragmentId",
    async ({ body, params, auth, status }) => {
      const { userId } = auth();

      if (!userId) return status(401, { error: "Unauthorized" });

      await requirePro(auth, status, "inline_code_edit");

      const existingFragment = await db.codeFragment.findUnique({
        where: { id: params.fragmentId },
        select: { files: true, sandboxId: true },
      });

      if (!existingFragment) throw new Error("Fragment not found");

      const sandboxId = existingFragment.sandboxId ?? body.sandboxId;

      if (!sandboxId) throw new Error("Missing sandbox Id");

      const sandbox = await getSandbox(sandboxId);

      const entries = Object.entries(body.files);

      for (const [path, content] of entries) {
        const fullPath = toProjectPath(path);
        await sandbox.files.write(fullPath, content);
      }

      const updatedFiles = {
        ...(existingFragment.files as Record<string, string>),
        ...body.files,
      };

      const updatedFragment = await db.codeFragment.update({
        where: { id: params.fragmentId },
        data: {
          files: updatedFiles,
        },
      });

      return updatedFragment;
    },
    {
      body: z.object({
        files: z.record(z.string(), z.string(), "Files is required"),
        projectId: z.string().min(3, "Project Id is required"),
        sandboxId: z.string().optional(),
      }),
      params: z.object({
        fragmentId: z.string().min(3, "Fragment Id is required"),
      }),
    },
  );
