import { useState, memo } from 'react'
import { Folder, ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import type { DirNode } from '@/stores/model-store'
 
interface DirTreeViewProps {
  node: DirNode
  currentPath: string | null
  pathSep: string
  onDirClick: (path: string) => void
}
 
function DirTreeNode({
  node,
  currentPath,
  pathSep,
  onDirClick,
  depth,
}: DirTreeNodeProps & { depth: number }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(depth === 0)
 
  const isActive = node.path === currentPath
  const hasChildren = node.children && node.children.length > 0
 
  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 cursor-pointer hover:bg-accent rounded px-1 py-0.5 text-xs',
          isActive && 'bg-accent text-accent-foreground',
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={() => {
          if (hasChildren) setOpen(!open)
          onDirClick(node.path)
        }}
      >
        {hasChildren ? (
          open ? <ChevronDown className="h-3 w-3 shrink-0" />
               : <ChevronRight className="h-3 w-3 shrink-0" />
        ) : (
          <span className="w-3" />
        )}
        <Folder className="h-3 w-3 shrink-0" />
        <span className="truncate min-w-0">{node.name}</span>
        <span className="ml-auto text-muted-foreground/60 shrink-0">
          {node.modelCount}
        </span>
      </div>
      {open && hasChildren && node.children!.map(child => (
        <DirTreeNode
          key={child.path}
          node={child}
          currentPath={currentPath}
          pathSep={pathSep}
          onDirClick={onDirClick}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}

export const DirTreeView = memo(function DirTreeView({
  node, currentPath, pathSep, onDirClick,
}: DirTreeViewProps) {
  return (
    <DirTreeNode
      node={node}
      currentPath={currentPath}
      pathSep={pathSep}
      onDirClick={onDirClick}
      depth={0}
    />
  )
})
