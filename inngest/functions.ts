import {
  createAgent,
  createNetwork,
  createState,
  createTool,
  type Message,
  openai,
  TextMessage,
  Tool,
} from "@inngest/agent-kit";
import { inngest } from "./client";
import Sandbox from "@e2b/code-interpreter";
import { getSandbox, toProjectPath } from "@/lib/sandbox";
import { z } from "zod";
import { PROMPT, TITLE_PROMPT } from "./prompt";
import { db } from "@/lib/db";
import { extractDesignSpecFromImage } from "@/lib/extract-design-spec";
import { searchUnsplashPhoto, UnsplashAttribution } from "@/lib/unsplash";
import { channel, topic } from "@inngest/realtime";

interface CodeAgentState {
  summary: string;
  files: Record<string, string>;
}

export const userChannel = channel("project").addTopic(
  topic("projectInfo").type<string>(),
);

export const projectChannel = channel(
  (projectId: string) => `Project:${projectId}`,
).addTopic(topic("projectInfo").type<string>());

const TIMEOUT_MS = 60 * 60 * 1000;

export const codeAgentFunction = inngest.createFunction(
  {
    id: "code-agent",
    concurrency: {
      limit: 1,
      key: "event.data.projectId",
    },
  },
  { event: "code-agent/codeAgent.run" },
  async ({ event, step, publish }) => {
    const sandboxId = await step.run("get-or-create-sandbox", async () => {
      const project = await db.project.findUnique({
        where: { id: event.data.projectId },
        select: { sandboxId: true },
      });

      if (project?.sandboxId) {
        const sandbox = await Sandbox.connect(project.sandboxId, {
          timeoutMs: TIMEOUT_MS,
        });

        return sandbox.sandboxId;
      }

      const createdSandbox = await Sandbox.create("forgeai-v1", {
        timeoutMs: TIMEOUT_MS,
      });

      await db.project.update({
        where: { id: event.data.projectId },
        data: { sandboxId: createdSandbox.sandboxId },
      });

      return createdSandbox.sandboxId;
    });

    const getPrevMessages = await step.run("get-prev-messages", async () => {
      const messages = await db.message.findMany({
        where: { projectId: event.data.projectId },
        orderBy: { updatedAt: "desc" },
        take: 6,
      });

      const latestMessages = messages
        .map((message) => {
          return {
            type: "text",
            role: message.role === "ASSISTANT" ? "assistant" : "user",
            content: message.content,
          };
        })
        .reverse();

      return latestMessages as Message[];
    });

    const getPrevCodeFiles = await step.run("get-prev-code-files", async () => {
      const lastMessage = await db.message.findFirst({
        where: {
          projectId: event.data.projectId,
          codeFragment: { isNot: null },
        },
        orderBy: { updatedAt: "desc" },
        include: { codeFragment: true },
      });

      return (lastMessage?.codeFragment?.files as Record<string, string>) || {};
    });

    const codingAgentState = createState<CodeAgentState>(
      {
        summary: "",
        files: getPrevCodeFiles,
      },
      { messages: getPrevMessages },
    );

    const metadataAgent = createAgent({
      name: "Forge ai project namer",
      system:
        "You create short, product-like project names (5 - 10 words, Title Case). Return ONLY the name",
      model: openai({
        model: "gpt-5.2",
      }),
    });

    const runNamingAgent = async (prompt: string) => {
      const result = await metadataAgent.run(prompt);

      const last = result.output.findLast(
        (message) => message.role === "assistant",
      ) as TextMessage | undefined;

      const projectName =
        typeof last?.content === "string"
          ? last.content.trim()
          : (
              last?.content.map((content) => content.text).join("") ?? ""
            ).trim();

      return projectName
        .replace(/^"+|"+$/g, "")
        .replace(/\s+/g, " ")
        .slice(0, 80);
    };

    const codeAgent = createAgent<CodeAgentState>({
      name: "coding agent",
      system: PROMPT,
      description: "An expert coding agent",
      model: openai({
        model: "gpt-5.2",
      }),

      tools: [
        createTool({
          name: "terminal",
          description: "Use terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }) => {
            const buffers = { stdout: "", stderr: "" };
            await publish(
              await projectChannel(event.data.projectId).projectInfo(
                "Installing packages...",
              ),
            );

            try {
              const sandbox = await getSandbox(sandboxId);
              const result = await sandbox.commands.run(command, {
                onStdout: (data: string) => {
                  buffers.stdout += data;
                },
                onStderr: (data: string) => {
                  buffers.stderr += data;
                },
              });

              return result.stdout;
            } catch (e) {
              console.error(
                `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`,
              );
              return `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
            }
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(z.object({ path: z.string(), content: z.string() })),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<CodeAgentState>,
          ) => {
            await publish(
              await projectChannel(event.data.projectId).projectInfo(
                "Generating project files...",
              ),
            );

            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);

                  for (const file of files) {
                    const fullPath = toProjectPath(file.path);
                    await sandbox.files.write(fullPath, file.content);
                    updatedFiles[file.path] = file.content;
                  }

                  return updatedFiles;
                } catch (e) {
                  return "Error: " + e;
                }
              },
            );

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
              return `Successfully updated ${files.length} files.`;
            }
          },
        }),

        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({ files: z.array(z.string()) }),
          handler: async ({ files }, { step }) => {
            await publish(
              await projectChannel(event.data.projectId).projectInfo(
                "Reading project files...",
              ),
            );

            return await step?.run("readFiles", async () => {
              try {
                const contents: Record<string, string>[] = [];
                const sandbox = await getSandbox(sandboxId);

                for (const file of files) {
                  const fullPath = toProjectPath(file);
                  const content = await sandbox.files.read(fullPath);
                  contents.push({
                    path: file,
                    content: content,
                  });
                }

                return JSON.stringify(contents);
              } catch (e) {
                return "Error: " + e;
              }
            });
          },
        }),
        createTool({
          name: "unsplashImage",
          description:
            "Search Unsplash and download an image into /public/assets/unsplash. Return local public path and attributions.",
          parameters: z.object({
            query: z.string().min(2),
            orientation: z
              .enum(["landscape", "portrait", "squarish"])
              .default("landscape"),
            purpose: z
              .enum([
                "hero",
                "feature",
                "testimonial",
                "background",
                "listing",
                "generic",
              ])
              .default("generic"),
            filenameHint: z.string().default(""),
          }),
          handler: async ({ query, orientation, purpose, filenameHint }) => {
            await publish(
              await projectChannel(event.data.projectId).projectInfo(
                "Downloading images...",
              ),
            );
            const accessKey = process.env.UNSPLASH_API_KEY;

            if (!accessKey) {
              throw new Error("Missing Unsplash API Key");
            }

            const sandbox = await getSandbox(sandboxId);

            const search = await searchUnsplashPhoto({
              accessKey,
              query,
              orientation,
            });

            const photo = search.results[0];
            if (!photo)
              throw new Error(`No Unsplash result for query: ${query}`);

            const imageUrl =
              (purpose === "background"
                ? photo.urls.full
                : photo.urls.regular) ?? photo.urls.regular;

            if (!imageUrl)
              throw new Error("Unsplash result missing usable image URL");

            const safeSlug = String(filenameHint ?? photo.id ?? query)
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "")
              .slice(0, 60);

            const publicDir = "/home/user/project/public/assets/unsplash";
            const localFile = `${publicDir}/${safeSlug}.jpg`;
            const publicPath = `/assets/unsplash/${safeSlug}.jpg`;

            await sandbox.commands.run(`mkdir -p "${publicDir}"`);

            const cmd = `curl -L --fail --silent --show-error "${imageUrl}" -o "${localFile}"`;
            const result = await sandbox.commands.run(cmd);

            if (result.exitCode !== 0) {
              const msg = (result.stderr || result.stdout || "").slice(0, 800);
              throw new Error(`Failed to download Unsplash image: ${msg}`);
            }

            const photographerName = photo.user.name ?? null;
            const photographerUsername = photo.user.username ?? null;
            const photoUrl = photo.links.html ?? null;

            const attributionUrl =
              photoUrl !== null
                ? `${photoUrl}?utm_source=forgeai&utm_medium=referral`
                : null;

            const attribution: UnsplashAttribution = {
              photographerName,
              photographerUsername,
              photoUrl,
              attributionUrl,
            };

            return { publicPath, localFile, attribution };
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastMessage = result.output.findLastIndex(
            (message) => message.role === "assistant",
          );

          const message =
            (result.output[lastMessage] as TextMessage) || undefined;

          const lastTextMessage = message.content
            ? typeof message.content === "string"
              ? message.content
              : message.content.map((c) => c.text).join("")
            : undefined;

          if (lastTextMessage && network) {
            if (lastTextMessage.includes("<task_summary>")) {
              network.state.data.summary = lastTextMessage;
            }
          }

          return result;
        },
      },
    });

    const network = createNetwork<CodeAgentState>({
      name: "codeing-agent-network",
      agents: [codeAgent],
      maxIter: 20,
      defaultState: codingAgentState,

      router: async ({ network }) => {
        if (network.state.data.summary) {
          return;
        }

        return codeAgent;
      },
    });

    const builderInput = await step.run("build-agent-input", async () => {
      if (!event.data.imageUrl) return event.data.message;

      const spec = await extractDesignSpecFromImage({
        imageUrl: event.data.imageUrl,
        userHint: event.data.message,
      });

      return [
        `designSpec:\n` +
          `${JSON.stringify(spec, null, 2)}\n\n` +
          `User notes:\n` +
          `${event.data.message}`,
      ].join("\n");
    });

    const result = await network.run(builderInput, { state: codingAgentState });

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      await publish(
        await projectChannel(event.data.projectId).projectInfo(
          "Generating sandbox url...",
        ),
      );
      const sandbox = await getSandbox(sandboxId);

      const host = sandbox.getHost(3000);

      return `https://${host}`;
    });

    const projectName = await runNamingAgent(
      `${TITLE_PROMPT} ${event.data.message}`,
    );

    await step.run("generate-metadata", async () => {
      await publish(
        await projectChannel(event.data.projectId).projectInfo(
          "Generating project name...",
        ),
      );

      await db.project.update({
        where: { id: event.data.projectId },
        data: {
          name: projectName || `Project-${Date.now()}`,
        },
      });
    });

    await step.run("save-to-db", async () => {
      await publish(
        await projectChannel(event.data.projectId).projectInfo(
          "Saving to db...",
        ),
      );
      const hasError = Object.keys(result.state.data.files || {}).length === 0;

      if (hasError) {
        return await db.message.create({
          data: {
            content: "Something went wrong, please try again",
            role: "ASSISTANT",
            type: "ERROR",
            projectId: event.data.projectId,
            userId: event.data.userId,
          },
        });
      }

      return await db.message.create({
        data: {
          content: result.state.data.summary,
          role: "ASSISTANT",
          projectId: event.data.projectId,
          type: "RESULT",
          userId: event.data.userId,
          codeFragment: {
            create: {
              sandboxUrl,
              sandboxId,
              title: "Code Fragment",
              files: result.state.data.files,
            },
          },
        },
      });
    });

    await publish(
      await projectChannel(event.data.projectId).projectInfo("Demo is ready"),
    );
    return {
      sandboxUrl,
      tile: "Code Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  },
);
