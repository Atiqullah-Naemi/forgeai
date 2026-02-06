type FeatureKey = "screenshot_upload" | "inline_code_edit";

export const requirePro = async (
  auth: () => { has: (p: { feature: FeatureKey }) => boolean },
  status: (code: number, body: unknown) => unknown,
  feature: FeatureKey,
) => {
  const { has } = auth();

  if (!has({ feature })) return status(403, { error: "Pro is required" });
};
