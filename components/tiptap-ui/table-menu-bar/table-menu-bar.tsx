"use client"

import { useCallback } from "react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { ToolbarGroup, ToolbarSeparator } from "@/components/tiptap-ui-primitive/toolbar"

export interface TableMenuBarProps {
  editor?: import("@tiptap/react").Editor
}

export function TableMenuBar({ editor: providedEditor }: TableMenuBarProps) {
  const { editor } = useTiptapEditor(providedEditor)

  const addColumnBefore = useCallback(() => {
    editor?.chain().focus().addColumnBefore().run()
  }, [editor])

  const addColumnAfter = useCallback(() => {
    editor?.chain().focus().addColumnAfter().run()
  }, [editor])

  const deleteColumn = useCallback(() => {
    editor?.chain().focus().deleteColumn().run()
  }, [editor])

  const addRowAbove = useCallback(() => {
    editor?.chain().focus().addRowBefore().run()
  }, [editor])

  const addRowBelow = useCallback(() => {
    editor?.chain().focus().addRowAfter().run()
  }, [editor])

  const deleteRow = useCallback(() => {
    editor?.chain().focus().deleteRow().run()
  }, [editor])

  const deleteTable = useCallback(() => {
    editor?.chain().focus().deleteTable().run()
  }, [editor])

  if (!editor || !editor.isEditable) {
    return null
  }

  const isInTable = editor.isActive("table")

  if (!isInTable) {
    return null
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1 border-b bg-muted/50 text-sm">
      <ToolbarGroup>
        <Button
          type="button"
          variant="ghost"
          size="small"
          onClick={addColumnBefore}
          disabled={!editor.can().addColumnBefore()}
          tooltip="Add column left"
        >
          <span className="text-xs">← Col</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="small"
          onClick={addColumnAfter}
          disabled={!editor.can().addColumnAfter()}
          tooltip="Add column right"
        >
          <span className="text-xs">Col →</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="small"
          onClick={deleteColumn}
          disabled={!editor.can().deleteColumn()}
          tooltip="Delete column"
        >
          <span className="text-xs">Del Col</span>
        </Button>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <Button
          type="button"
          variant="ghost"
          size="small"
          onClick={addRowAbove}
          disabled={!editor.can().addRowBefore()}
          tooltip="Add row above"
        >
          <span className="text-xs">↑ Row</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="small"
          onClick={addRowBelow}
          disabled={!editor.can().addRowAfter()}
          tooltip="Add row below"
        >
          <span className="text-xs">Row ↓</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="small"
          onClick={deleteRow}
          disabled={!editor.can().deleteRow()}
          tooltip="Delete row"
        >
          <span className="text-xs">Del Row</span>
        </Button>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <Button
          type="button"
          variant="ghost"
          size="small"
          onClick={deleteTable}
          disabled={!editor.can().deleteTable()}
          tooltip="Delete table"
        >
          <span className="text-xs">Del Table</span>
        </Button>
      </ToolbarGroup>
    </div>
  )
}

export default TableMenuBar