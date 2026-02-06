"use client";

import { FileCode, FileJson, FileText } from "lucide-react";
import {
  TreeExpander,
  TreeIcon,
  TreeLabel,
  TreeNode,
  TreeNodeContent,
  TreeNodeTrigger,
  TreeProvider,
  TreeView as TreeViewWrapper,
} from "./kibo-ui/tree";
import { useMemo } from "react";

type FilesMap = Record<string, string>;
interface TreeItem {
  id: string;
  name: string;
  kind: "folder" | "file";
  children?: TreeItem[];
}

const buildTree = (files: FilesMap) => {
  const root: TreeItem[] = [];
  const folderIndex = new Map<string, TreeItem>();

  const ensureFolder = (
    id: string,
    name: string,
    parentChildren: TreeItem[]
  ) => {
    const existing = folderIndex.get(id);
    if (existing) return existing;

    const node: TreeItem = { id, name, kind: "folder", children: [] };
    parentChildren.push(node);
    folderIndex.set(id, node);

    return node;
  };

  Object.keys(files)
    .sort((a, b) => a.localeCompare(b))
    .forEach((fullPath) => {
      const parts = fullPath.split("/").filter(Boolean);

      let currentChildren = root;
      let currentPath = "";

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;

        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!isLast) {
          const folder = ensureFolder(currentPath, part, currentChildren);
          currentChildren = folder.children as TreeItem[];
        } else {
          currentChildren.push({
            id: currentPath,
            name: part,
            kind: "file",
          });
        }
      }
    });

  const sortFilesAndFolders = (nodes: TreeItem[]) => {
    nodes.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    nodes.forEach((n) => n.children && sortFilesAndFolders(n.children));
  };

  sortFilesAndFolders(root);

  return root;
};

const fileIcon = (name: string) => {
  const lowerName = name.toLocaleLowerCase();

  if (lowerName.endsWith(".json")) return <FileJson className="h-4 w-4" />;

  if (
    lowerName.endsWith(".ts") ||
    lowerName.endsWith(".tsx") ||
    lowerName.endsWith(".js") ||
    lowerName.endsWith(".jsx")
  )
    return <FileCode className="h-4 w-4" />;

  return <FileText className="h-4 w-4" />;
};

const RenderNodes = ({
  nodes,
  level = 0,
  onSelect,
}: {
  nodes: TreeItem[];
  level?: number;
  onSelect?: (path: string) => void;
}) => {
  return (
    <>
      {nodes.map((node, index) => {
        const isLast = index === nodes.length - 1;
        const hasChildren =
          node.kind === "folder" && (node.children?.length ?? 0) > 0;
        const isFile = node.kind === "file";

        return (
          <TreeNode
            key={node.id}
            nodeId={node.id}
            level={level}
            isLast={isLast}
          >
            <TreeNodeTrigger
              onClick={(e) => {
                if (!isFile) return;
                e.stopPropagation();
                onSelect?.(node.id);
              }}
            >
              <TreeExpander hasChildren={hasChildren} />
              <TreeIcon
                hasChildren={hasChildren}
                icon={isFile ? fileIcon(node.name) : undefined}
              />
              <TreeLabel> {node.name} </TreeLabel>
            </TreeNodeTrigger>

            {hasChildren ? (
              <TreeNodeContent hasChildren>
                <RenderNodes
                  nodes={node.children!}
                  level={level + 1}
                  onSelect={onSelect}
                />
              </TreeNodeContent>
            ) : null}
          </TreeNode>
        );
      })}
    </>
  );
};

export function TreeView({
  files,
  defaultExpandedIds,
  onSelect,
}: {
  files: FilesMap;
  defaultExpandedIds?: string[];
  onSelect?: (path: string) => void;
}) {
  const tree = useMemo(() => buildTree(files), [files]);
  const computedDefaulExpandedIds = useMemo(() => {
    if (defaultExpandedIds?.length) return defaultExpandedIds;

    return tree.filter((node) => node.kind === "folder").map((node) => node.id);
  }, [defaultExpandedIds, tree]);

  return (
    <TreeProvider
      defaultExpandedIds={computedDefaulExpandedIds}
      onSelectionChange={(ids) => {
        const last = ids?.[ids.length - 1];
        if (!last) return;

        if (files[last]) onSelect?.(last);
      }}
    >
      <TreeViewWrapper>
        <RenderNodes nodes={tree} onSelect={onSelect} />
      </TreeViewWrapper>
    </TreeProvider>
  );
}
