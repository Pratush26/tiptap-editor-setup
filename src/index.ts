import { SimpleEditor } from "./components/tiptap-templates/simple/simple-editor"
import { SimpleEditorPreview } from "./components/tiptap-templates/simple/simple-editor-preview"

export { SimpleEditor } from "./components/tiptap-templates/simple/simple-editor"
// export type { SimpleEditorProps } from "./components/tiptap-templates/simple/simple-editor"
export type SimpleEditorProps = React.ComponentProps<typeof SimpleEditor>
export { SimpleEditorPreview } from "./components/tiptap-templates/simple/simple-editor-preview"
export { stripTrailingEmptyParagraphs } from "./components/tiptap-templates/simple/simple-editor-preview"
export { getCleanHTML, getCleanJSON, cleanEditorJson } from "./utils/clean-html"
export type SimpleEditorPreviewProps = React.ComponentProps<typeof SimpleEditorPreview>
// export { SimpleEditorPreviewProps } from "./components/tiptap-templates/simple/simple-editor-preview"