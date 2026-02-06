import { CodeFragment } from "@/lib/generated/prisma/client";
import { useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { IconExternalLink, IconRefresh } from "@tabler/icons-react";

interface Props {
  data: CodeFragment;
}

interface SandboxUrlBarProps {
  sandboxBaseUrl: string;
  fullUrl: string;
  disabled: boolean;
  onNavigate: (path: string) => void;
}

export function CodeWebView({ data }: Props) {
  const [fragmentKey, setFragmentKey] = useState(0);
  const [path, setPath] = useState<string>("/");
  const baseUrl = data.sandboxUrl ?? "";

  const fullUrl = useMemo(() => {
    if (!baseUrl) return "";

    const safePath = path.startsWith("/") ? path : `/${path}`;

    return `${baseUrl}${safePath}`;
  }, [baseUrl, path]);

  const canRender = Boolean(baseUrl);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="border-b bg-sidebar flex items-center gap-2 p-2">
        <Button
          size="sm"
          variant="outline"
          className="cursor-pointer"
          onClick={() => setFragmentKey((prev) => prev + 1)}
          disabled={!canRender}
        >
          <IconRefresh />
        </Button>
        <SandboxUrlBar
          sandboxBaseUrl={baseUrl}
          fullUrl={fullUrl}
          onNavigate={(path) => setPath(path)}
          disabled={!canRender}
        />
        <Button
          size="sm"
          variant="outline"
          className="cursor-pointer"
          onClick={() => {
            if (!data.sandboxUrl) return;
            window.open(data.sandboxUrl, "_blank");
          }}
        >
          <IconExternalLink />
        </Button>
      </div>
      <iframe
        key={`${fragmentKey}:${fullUrl}`}
        className="h-full w-full"
        sandbox="allow-forms allow-scripts allow-same-origin"
        loading="lazy"
        src={fullUrl}
      />
    </div>
  );
}

export function SandboxUrlBar({
  sandboxBaseUrl,
  fullUrl,
  disabled,
  onNavigate,
}: SandboxUrlBarProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draft, setDraft] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    setDraft(fullUrl);
    setIsEditing(true);
  };

  const commit = () => {
    const raw = draft.trim();
    setIsEditing(false);

    const nextPath = raw.startsWith("/")
      ? raw
      : raw.startsWith(sandboxBaseUrl)
      ? raw.slice(sandboxBaseUrl.length) || "/"
      : `/${raw}`;
    const normalized = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
    onNavigate(normalized);
  };

  return (
    <div className="flex-1">
      {isEditing ? (
        <input
          ref={inputRef}
          autoFocus
          disabled={disabled}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
        />
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={startEditing}
          className="h-9 w-full truncate rounded-md border px-3 text-start text-sm font-normal hover:bg-muted
          disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          {fullUrl || "-"}
        </button>
      )}
    </div>
  );
}
