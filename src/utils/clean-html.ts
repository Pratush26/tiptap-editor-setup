import type { Editor } from "@tiptap/core"
import type { JSONContent } from "@tiptap/core"

import { stripTrailingEmptyParagraphs } from "../components/tiptap-templates/simple/simple-editor-preview"

function isEmptyParagraphJson(node: JSONContent | undefined): boolean {
  if (!node || node.type !== "paragraph") return false
  const content = node.content ?? []
  if (content.length === 0) return true
  return content.every((child) => {
    if (child?.type === "text") return !child.text || !child.text.trim()
    if (child?.type === "hardBreak") return true
    return false
  })
}

export function cleanEditorJson(json: any): any {
  if (!json || !Array.isArray(json.content)) return json
  let end = json.content.length
  while (end > 0 && isEmptyParagraphJson(json.content[end - 1])) end--
  return { ...json, content: json.content.slice(0, end) }
}

export function getCleanHTML(editor: Editor): string {
  return stripTrailingEmptyParagraphs(editor.getHTML())
}

export function getCleanJSON(editor: Editor): JSONContent {
  return cleanEditorJson(editor.getJSON())
}
