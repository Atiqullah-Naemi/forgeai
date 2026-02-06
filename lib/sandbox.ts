import Sandbox from "@e2b/code-interpreter";
import path from "path";

export const PROJECTROOT = "/home/user/project";

export async function getSandbox(sandboxId: string) {
  return await Sandbox.connect(sandboxId);
}

export const toProjectPath = (p: string) => {
  const normalized = p.replace(/\\/g, "/").trim();
  if (normalized.startsWith("/")) return normalized;

  return path.posix.join(PROJECTROOT, normalized);
};
