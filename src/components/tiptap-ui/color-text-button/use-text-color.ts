"use client"

import { useCallback, useEffect, useState } from "react"
import { type Editor } from "@tiptap/react"
import { useHotkeys } from "react-hotkeys-hook"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"

// --- Lib ---
import { isMarkInSchema, isNodeTypeSelected } from "@/lib/tiptap-utils"

// --- Icons ---
import { TypeColorIcon } from "@/components/tiptap-icons/type-color-icon"

export const TEXT_COLOR_SHORTCUT_KEY = "mod+shift+c"

export const TEXT_COLORS = [
  {
    label: "Default",
    value: "",
    colorValue: "#000000",
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

export type TextColor = (typeof TEXT_COLORS)[number]

export interface UseTextColorConfig {
  editor?: Editor | null
  textColor?: string
  label?: string
  hideWhenUnavailable?: boolean
  onApplied?: ({
    color,
    label,
  }: {
    color: string
    label: string
  }) => void
}

export function pickTextColorsByValue(values: string[]) {
  const colorMap = new Map(TEXT_COLORS.map((color) => [color.value, color]))
  return values
    .map((value) => colorMap.get(value))
    .filter((color): color is TextColor => !!color)
}

export function canTextColor(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isMarkInSchema("textStyle", editor) || isNodeTypeSelected(editor, ["image"])) return false
  return editor.can().setMark("textStyle")
}

export function isTextColorActive(
  editor: Editor | null,
  textColor?: string
): boolean {
  if (!editor || !editor.isEditable) return false
  if (textColor) {
    return editor.isActive("textStyle", { color: textColor })
  }
  return editor.isActive("textStyle")
}

export function removeTextColor(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canTextColor(editor)) return false
  return editor.chain().focus().unsetMark("textStyle").run()
}

export function useTextColor(config: UseTextColorConfig) {
  const {
    editor: providedEditor,
    label,
    textColor,
    hideWhenUnavailable = false,
    onApplied,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsBreakpoint()
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const canTextColorState = canTextColor(editor)
  const isActive = isTextColorActive(editor, textColor)

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      if (!hideWhenUnavailable) {
        setIsVisible(true)
        return
      }
      setIsVisible(canTextColor(editor) || editor.isActive("textStyle"))
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable])

  const handleTextColor = useCallback(
    (color?: string) => {
      if (!editor || !canTextColorState) return false

      const targetColor = color ?? textColor
      if (!targetColor) return false

      const success = editor
        .chain()
        .focus()
        .setMark("textStyle", { color: targetColor })
        .run()

      if (success) {
        onApplied?.({ color: targetColor, label: label || "Text color" })
      }
      return success
    },
    [canTextColorState, editor, label, onApplied, textColor]
  )

  const handleRemoveTextColor = useCallback(() => {
    const success = removeTextColor(editor)
    if (success) {
      onApplied?.({ color: "", label: "Remove text color" })
    }
    return success
  }, [editor, onApplied])

  useHotkeys(
    TEXT_COLOR_SHORTCUT_KEY,
    (event) => {
      event.preventDefault()
      handleTextColor()
    },
    {
      enabled: isVisible && canTextColorState,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    }
  )

  return {
    isVisible,
    isActive,
    handleTextColor,
    handleRemoveTextColor,
    canTextColor: canTextColorState,
    label: label || "Text color",
    shortcutKeys: TEXT_COLOR_SHORTCUT_KEY,
    Icon: TypeColorIcon,
  }
}