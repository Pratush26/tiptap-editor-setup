"use client"

import { forwardRef, useCallback, useMemo } from "react"

// --- Lib ---
import { parseShortcutKeys } from "@/lib/tiptap-utils"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import type { UseTextColorConfig } from "@/components/tiptap-ui/color-text-button"
import {
  TEXT_COLOR_SHORTCUT_KEY,
  useTextColor,
} from "@/components/tiptap-ui/color-text-button"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Badge } from "@/components/tiptap-ui-primitive/badge"

// --- Styles ---

export interface ColorTextButtonProps
  extends Omit<ButtonProps, "type">,
    UseTextColorConfig {
  text?: string
  showShortcut?: boolean
}

export function ColorTextShortcutBadge({
  shortcutKeys = TEXT_COLOR_SHORTCUT_KEY,
}: {
  shortcutKeys?: string
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>
}

export const ColorTextButton = forwardRef<HTMLButtonElement, ColorTextButtonProps>(
  (
    {
      editor: providedEditor,
      textColor,
      text,
      hideWhenUnavailable = false,
      onApplied,
      showShortcut = false,
      onClick,
      children,
      style,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const {
      isVisible,
      canTextColor,
      isActive,
      handleTextColor,
      label,
      shortcutKeys,
    } = useTextColor({
      editor,
      textColor,
      label: text || `Set text color (${textColor})`,
      hideWhenUnavailable,
      onApplied,
    })

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleTextColor()
      },
      [handleTextColor, onClick]
    )

    const buttonStyle = useMemo(
      () =>
        ({
          ...style,
          "--text-color": textColor,
        }) as React.CSSProperties,
      [textColor, style]
    )

    if (!isVisible) {
      return null
    }

    return (
      <Button
        type="button"
        variant="ghost"
        data-active-state={isActive ? "on" : "off"}
        role="button"
        tabIndex={-1}
        disabled={!canTextColor}
        data-disabled={!canTextColor}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        style={buttonStyle}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <span
              className="tiptap-button-text-color"
              style={
                { "--text-color": textColor } as React.CSSProperties
              }
            />
            {text && <span className="tiptap-button-text">{text}</span>}
            {showShortcut && (
              <ColorTextShortcutBadge shortcutKeys={shortcutKeys} />
            )}
          </>
        )}
      </Button>
    )
  }
)

ColorTextButton.displayName = "ColorTextButton"