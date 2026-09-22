"use client"

import { forwardRef, useCallback, useMemo, useRef, useState } from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useMenuNavigation } from "@/hooks/use-menu-navigation"
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { BanIcon } from "@/components/tiptap-icons/ban-icon"
import { TypeColorIcon } from "@/components/tiptap-icons/type-color-icon"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
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

// --- Tiptap UI ---
import type { TextColor } from "@/components/tiptap-ui/color-text-button"
import {
  TEXT_COLORS,
  useTextColor,
} from "@/components/tiptap-ui/color-text-button"
import { ButtonGroup } from "@/components/tiptap-ui-primitive/button-group"

// --- Styles ---

export interface ColorTextPopoverContentProps {
  editor?: Editor | null
  colors?: TextColor[]
}

export interface ColorTextPopoverProps
  extends Omit<ButtonProps, "type">,
    Pick<
      {
        editor?: Editor | null
        hideWhenUnavailable?: boolean
        onApplied?: (props: { color: string; label: string }) => void
      },
      "editor" | "hideWhenUnavailable" | "onApplied"
    > {
  colors?: TextColor[]
}

export const ColorTextPopoverButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => (
    <Button
      type="button"
      className={className}
      variant="ghost"
      data-appearance="default"
      role="button"
      tabIndex={-1}
      aria-label="Text color"
      tooltip="Text color"
      ref={ref}
      {...props}
    >
      {children ?? <TypeColorIcon className="tiptap-button-icon" />}
    </Button>
  )
)

ColorTextPopoverButton.displayName = "ColorTextPopoverButton"

function TextColorSwatchButton({
  editor,
  textColor,
  tooltip,
  onApply,
  ...buttonProps
}: {
  editor?: Editor | null
  textColor: string
  tooltip: string
  onApply: (color: string) => void
} & Omit<ButtonProps, "type">) {
  const { handleTextColor, isActive } = useTextColor({
    editor,
    textColor,
    label: tooltip,
  })

  const handleClick = useCallback(() => {
    handleTextColor(textColor)
    onApply(textColor)
  }, [handleTextColor, textColor, onApply])

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
      {...buttonProps}
    >
      <span
        className="tiptap-button-text-color"
        style={{ "--text-color": textColor } as React.CSSProperties}
      />
    </Button>
  )
}

export function ColorTextPopoverContent({
  editor,
  colors = TEXT_COLORS,
}: ColorTextPopoverContentProps) {
  const { handleRemoveTextColor } = useTextColor({ editor })
  const isMobile = useIsBreakpoint()
  const containerRef = useRef<HTMLDivElement>(null)
  const [customColor, setCustomColor] = useState("#000000")

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
      if (item.value === "") handleRemoveTextColor()
      return true
    },
    autoSelectFirstItem: false,
  })

  const handleCustomColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const color = e.target.value
      setCustomColor(color)
    },
    []
  )

  const handleCustomColorApply = useCallback(() => {
    if (!editor || !editor.isEditable) return
    editor.chain().focus().setMark("textStyle", { color: customColor }).run()
  }, [customColor, editor])

  return (
    <Card
      ref={containerRef}
      tabIndex={0}
      style={isMobile ? { boxShadow: "none", border: 0 } : {}}
    >
      <CardBody style={isMobile ? { padding: 0 } : {}}>
        <CardItemGroup orientation="horizontal">
          <ButtonGroup>
            {colors.map((color, index) => (
              <ButtonGroup key={color.value}>
                <TextColorSwatchButton
                  editor={editor}
                  textColor={color.value}
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
              onClick={handleRemoveTextColor}
              aria-label="Remove text color"
              tooltip="Remove text color"
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
        <div className="color-text-popover-picker">
          <label className="color-text-popover-picker-label">Custom color</label>
          <div className="color-text-popover-picker-row">
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              className="color-text-popover-picker-input"
            />
            <span className="color-text-popover-picker-hex">{customColor}</span>
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

export function ColorTextPopover({
  editor: providedEditor,
  colors = TEXT_COLORS,
  hideWhenUnavailable = false,
  onApplied,
  ...props
}: ColorTextPopoverProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = useState(false)
  const { isVisible, canTextColor, isActive, label, Icon } = useTextColor({
    editor,
    hideWhenUnavailable,
    onApplied,
  })

  if (!isVisible) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <ColorTextPopoverButton
          disabled={!canTextColor}
          data-active-state={isActive ? "on" : "off"}
          data-disabled={!canTextColor}
          aria-pressed={isActive}
          aria-label={label}
          tooltip={label}
          {...props}
        >
          <Icon className="tiptap-button-icon" />
        </ColorTextPopoverButton>
      </PopoverTrigger>
      <PopoverContent aria-label="Text colors">
        <ColorTextPopoverContent editor={editor} colors={colors} />
      </PopoverContent>
    </Popover>
  )
}

export default ColorTextPopover
