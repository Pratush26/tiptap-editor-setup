"use client"

import { useCallback, useState } from "react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"
import { TableIcon } from "@/components/tiptap-icons/table-icon"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/tiptap-ui-primitive/dropdown-menu"

const GRID_MAX_ROWS = 8
const GRID_MAX_COLS = 8

export interface TableInsertButtonProps extends Omit<ButtonProps, "type"> {
  editor?: import("@tiptap/react").Editor
  modal?: boolean
}

export function TableInsertButton({
  editor: providedEditor,
  modal = false,
  ...buttonProps
}: TableInsertButtonProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredRows, setHoveredRows] = useState(0)
  const [hoveredCols, setHoveredCols] = useState(0)

  const handleInsertTable = useCallback(
    (rows: number, cols: number) => {
      if (!editor) return
      editor
        .chain()
        .focus()
        .insertTable({ rows, cols, withHeaderRow: true })
        .run()
      setIsOpen(false)
      setHoveredRows(0)
      setHoveredCols(0)
    },
    [editor]
  )

  if (!editor || !editor.isEditable) {
    return null
  }

  return (
    <DropdownMenu modal={modal} open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label="Insert table"
          tooltip="Table"
          {...buttonProps}
        >
          <TableIcon className="tiptap-button-icon" />
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <div className="tiptap-table-insert-label">
          {hoveredRows > 0 && hoveredCols > 0
            ? `${hoveredRows} x ${hoveredCols}`
            : "Insert table"}
        </div>
        <div
          className="tiptap-table-insert-grid"
          style={{ gridTemplateColumns: `repeat(${GRID_MAX_COLS}, 1.25rem)` }}
          onMouseLeave={() => {
            setHoveredRows(0)
            setHoveredCols(0)
          }}
        >
          {Array.from({ length: GRID_MAX_ROWS }).map((_, row) =>
            Array.from({ length: GRID_MAX_COLS }).map((_, col) => {
              const isHighlighted = row < hoveredRows && col < hoveredCols
              return (
                <button
                  key={`${row}-${col}`}
                  type="button"
                  className="tiptap-table-insert-cell"
                  data-highlighted={isHighlighted ? "true" : "false"}
                  onMouseEnter={() => {
                    setHoveredRows(row + 1)
                    setHoveredCols(col + 1)
                  }}
                  onClick={() => handleInsertTable(row + 1, col + 1)}
                  aria-label={`Insert ${row + 1} by ${col + 1} table`}
                />
              )
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TableInsertButton