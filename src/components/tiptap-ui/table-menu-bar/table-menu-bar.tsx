"use client"

import { forwardRef, useCallback, useMemo, useRef, useState } from "react"
import type { Editor } from "@tiptap/react"
import type { Node as PMNode } from "@tiptap/pm/model"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useMenuNavigation } from "@/hooks/use-menu-navigation"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { ToolbarGroup, ToolbarSeparator } from "@/components/tiptap-ui-primitive/toolbar"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/tiptap-ui-primitive/popover"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import {
  Card,
  CardBody,
  CardItemGroup,
} from "@/components/tiptap-ui-primitive/card"
import { ButtonGroup } from "@/components/tiptap-ui-primitive/button-group"

// --- Icons ---
import { BanIcon } from "@/components/tiptap-icons/ban-icon"
import { TypeColorIcon } from "@/components/tiptap-icons/type-color-icon"

export const CELL_COLORS = [
  {
    label: "Default",
    value: "",
    colorValue: "#ffffff",
  },
  {
    label: "Primary",
    value: "var(--primary)",
    colorValue: "var(--primary)",
  },
  {
    label: "Secondary",
    value: "var(--secondary)",
    colorValue: "var(--secondary)",
  },
  {
    label: "Accent",
    value: "var(--accent-foreground)",
    colorValue: "var(--accent-foreground)",
  },
]

export type CellColor = (typeof CELL_COLORS)[number]

export interface TableMenuBarProps {
  editor?: Editor
}

function getFirstRow(editor: Editor): { row: PMNode; pos: number } | null {
  const { selection } = editor.state
  const $pos = selection.$anchor

  for (let depth = $pos.depth; depth >= 0; depth--) {
    const node = $pos.node(depth)
    if (node.type.name === "table") {
      const tablePos = $pos.start(depth) - 1
      const firstChild = node.child(0)
      return { row: firstChild, pos: tablePos + 1 }
    }
  }
  return null
}

function isFirstRowHeader(row: PMNode): boolean {
  for (let i = 0; i < row.childCount; i++) {
    if (row.child(i).type.name === "tableHeader") {
      return true
    }
  }
  return false
}

function isInTable(editor: Editor): boolean {
  const { selection } = editor.state
  const $pos = selection.$anchor
  for (let depth = $pos.depth; depth >= 0; depth--) {
    if ($pos.node(depth).type.name === "table") return true
  }
  return false
}

function getCurrentCellBackground(editor: Editor): string | null {
  const { selection } = editor.state
  const $pos = selection.$anchor

  for (let depth = $pos.depth; depth >= 0; depth--) {
    const node = $pos.node(depth)
    if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
      return (node.attrs?.backgroundColor as string) ?? null
    }
  }
  return null
}

function setCellBackground(editor: Editor, color: string) {
  if (!isInTable(editor)) return false
  return editor.chain().focus().setNodeBackgroundColor(color).run()
}

function removeCellBackground(editor: Editor) {
  if (!isInTable(editor)) return false
  return editor.chain().focus().unsetNodeBackgroundColor().run()
}

const CellColorSwatchButton = forwardRef<
  HTMLButtonElement,
  {
    editor: Editor
    cellColor: string
    tooltip: string
    onApply: (color: string) => void
  } & Omit<ButtonProps, "type">
>(({ editor, cellColor, tooltip, onApply, ...buttonProps }, ref) => {
  const currentBg = getCurrentCellBackground(editor)
  const isActive = cellColor
    ? currentBg === cellColor
    : currentBg === null || currentBg === ""

  const handleClick = useCallback(() => {
    if (cellColor) {
      setCellBackground(editor, cellColor)
    } else {
      removeCellBackground(editor)
    }
    onApply(cellColor)
  }, [editor, cellColor, onApply])

  return (
    <Button
      type="button"
      variant="ghost"
      data-active-state={isActive ? "on" : "off"}
      role="button"
      tabIndex={-1}
      aria-label={tooltip}
      aria-pressed={isActive}
      tooltip={tooltip}
      onClick={handleClick}
      ref={ref}
      {...buttonProps}
    >
      <span
        className="tiptap-button-highlight"
        style={{ backgroundColor: cellColor || "#ffffff" } as React.CSSProperties}
      />
    </Button>
  )
})
CellColorSwatchButton.displayName = "CellColorSwatchButton"

function CellColorPopoverContent({
  editor,
  colors = CELL_COLORS,
}: {
  editor: Editor
  colors?: CellColor[]
}) {
  const [customColor, setCustomColor] = useState("#ffffff")
  const containerRef = useRef<HTMLDivElement>(null)

  const menuItems = useMemo(
    () => [...colors, { label: "Remove color", value: "" }],
    [colors]
  )

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: "both",
    onSelect: (item) => {
      if (!containerRef.current) return false
      const highlightedElement = containerRef.current.querySelector(
        '[data-highlighted="true"]'
      ) as HTMLElement
      if (highlightedElement) highlightedElement.click()
      if (item.value === "") removeCellBackground(editor)
      return true
    },
    autoSelectFirstItem: false,
  })

  const handleCustomColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomColor(e.target.value)
    },
    []
  )

  const handleCustomColorApply = useCallback(() => {
    setCellBackground(editor, customColor)
  }, [customColor, editor])

  const handleRemove = useCallback(() => {
    removeCellBackground(editor)
  }, [editor])

  return (
    <Card
      ref={containerRef}
      tabIndex={0}
    >
      <CardBody>
        <CardItemGroup orientation="horizontal">
          <ButtonGroup>
            {colors.map((color, index) => (
              <ButtonGroup key={color.value}>
                <CellColorSwatchButton
                  editor={editor}
                  cellColor={color.value}
                  tooltip={color.label}
                  onApply={() => {}}
                  tabIndex={selectedIndex === index ? 0 : -1}
                  data-highlighted={selectedIndex === index}
                />
              </ButtonGroup>
            ))}
          </ButtonGroup>
          <Separator />
          <ButtonGroup>
            <Button
              onClick={handleRemove}
              aria-label="Remove cell background"
              tooltip="Remove cell background"
              tabIndex={selectedIndex === colors.length ? 0 : -1}
              type="button"
              role="menuitem"
              variant="ghost"
              data-highlighted={selectedIndex === colors.length}
            >
              <BanIcon className="tiptap-button-icon" />
            </Button>
          </ButtonGroup>
        </CardItemGroup>
        <Separator />
        <div className="table-cell-color-picker">
          <label className="table-cell-color-picker-label">Custom color</label>
          <div className="table-cell-color-picker-row">
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              className="table-cell-color-picker-input"
            />
            <span className="table-cell-color-picker-hex">{customColor}</span>
            <Button
              type="button"
              variant="ghost"
              onClick={handleCustomColorApply}
              aria-label="Apply custom color"
              tooltip="Apply"
            >
              <TypeColorIcon className="tiptap-button-icon" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

function CellColorPicker({ editor }: { editor: Editor }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="small"
          disabled={!isInTable(editor)}
          tooltip="Cell background color"
        >
          <span className="tiptap-button-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="3" y="16" width="18" height="5" rx="0" fill="currentColor" />
            </svg>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Cell background colors">
        <CellColorPopoverContent editor={editor} />
      </PopoverContent>
    </Popover>
  )
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

  const toggleHeaderRow = useCallback(() => {
    if (!editor) return

    const result = getFirstRow(editor)
    if (!result) return

    const { row, pos } = result
    const hasHeader = isFirstRowHeader(row)
    const cellType = hasHeader ? "tableCell" : "tableHeader"
    const cellTypeName = cellType

    let tr = editor.state.tr
    let offset = 1

    for (let i = 0; i < row.childCount; i++) {
      const cell = row.child(i)
      if (cell.type.name !== cellTypeName) {
        const newCell = editor.schema.nodes[cellTypeName].create(
          { ...cell.attrs },
          cell.content
        )
        tr = tr.replaceWith(pos + offset, pos + offset + cell.nodeSize, newCell)
      }
      offset += cell.nodeSize
    }

    if (tr.docChanged) {
      editor.view.dispatch(tr)
    }
  }, [editor])

  if (!editor || !editor.isEditable) {
    return null
  }

  const isInTableCell = isInTable(editor)

  if (!isInTableCell) {
    return null
  }

  const firstRowData = getFirstRow(editor)
  const hasHeaderRow = firstRowData ? isFirstRowHeader(firstRowData.row) : false

  return (
    <div className="tiptap-table-menu-bar">
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
          onClick={toggleHeaderRow}
          data-active-state={hasHeaderRow ? "on" : "off"}
          tooltip={hasHeaderRow ? "Remove header row" : "Add header row"}
        >
          <span className="text-xs">Hdr Row</span>
        </Button>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <CellColorPicker editor={editor} />
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
