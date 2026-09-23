"use client"

import type { JSONContent } from "@tiptap/core"
import type { JSX } from "react"

interface SimpleEditorPreviewProps {
  content: JSONContent | string
  className?: string
  textScale?: number
}

function wrapTablesInHtml(html: string): string {
  return html
    .replace(/<table(\b[^>]*)>/gi, '<div class="table-wrapper"><table$1>')
    .replace(/<\/table>/gi, '</table></div>')
}

function renderNode(node: JSONContent, index: number): React.ReactNode {
  if (!node) return null

  const children = node.content?.map((child, i) => renderNode(child, i)) ?? []

  switch (node.type) {
    case "heading": {
      const level = node.attrs?.level ?? 1
      const Tag = `h${level}` as keyof JSX.IntrinsicElements
      return <Tag key={index}>{children}</Tag>
    }

    case "paragraph":
      return <p key={index}>{children}</p>

    case "bulletList":
      return <ul key={index}>{children}</ul>

    case "orderedList":
      return <ol key={index}>{children}</ol>

    case "listItem":
      return <li key={index}>{children}</li>

    case "taskList":
      return (
        <ul key={index} className="preview-task-list">
          {node.content?.map((item, i) => {
            const checked = item.content?.[0]?.attrs?.checked ?? false
            const text = item.content?.[1]?.content ?? []
            return (
              <li key={i} className="preview-task-item">
                <span
                  className="preview-task-checkbox"
                  data-checked={checked ? "true" : "false"}
                />
                {checked ? (
                  <span className="preview-task-text-checked">
                    {text.map((t, j) => renderNode(t, j))}
                  </span>
                ) : (
                  <span>{text.map((t, j) => renderNode(t, j))}</span>
                )}
              </li>
            )
          })}
        </ul>
      )

    case "blockquote":
      return <blockquote key={index}>{children}</blockquote>

    case "codeBlock": {
      const code = node.content?.map((c) => c.text ?? "").join("") ?? ""
      return (
        <pre key={index}>
          <code>{code}</code>
        </pre>
      )
    }

    case "horizontalRule":
      return <hr key={index} />

    case "image": {
      const src = node.attrs?.src ?? ""
      const alt = node.attrs?.alt ?? ""
      return (
        <figure key={index} className="preview-figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} />
          {alt && <figcaption>{alt}</figcaption>}
        </figure>
      )
    }

    case "table":
      return (
        <div key={index} className="table-wrapper">
          <table className="simple-editor-preview-content">
            {children}
          </table>
        </div>
      )

    case "tableRow":
      return <tr key={index}>{children}</tr>

    case "tableCell":
      return (
        <td
          key={index}
          style={node.attrs?.backgroundColor ? { backgroundColor: node.attrs.backgroundColor } : undefined}
        >
          {children}
        </td>
      )

    case "tableHeader":
      return (
        <th
          key={index}
          style={node.attrs?.backgroundColor ? { backgroundColor: node.attrs.backgroundColor } : undefined}
        >
          {children}
        </th>
      )

    case "text":
      return <span key={index}>{node.text}</span>

    case "hardBreak":
      return <br key={index} />

    default:
      return <span key={index}>{children}</span>
  }
}

export function SimpleEditorPreview({
  content,
  className,
  textScale = 1,
}: SimpleEditorPreviewProps) {
  if (!content) return null

  if (typeof content === "string") {
    return (
      <div
        className={`simple-editor-preview-content${className ? ` ${className}` : ""}`}
        style={{ zoom: textScale }}
        dangerouslySetInnerHTML={{ __html: wrapTablesInHtml(content) }}
      />
    )
  }

  return (
    <div
      className={`simple-editor-preview-content${className ? ` ${className}` : ""}`}
      style={{ zoom: textScale }}
    >
      {content.content?.map((node, i) => renderNode(node, i)) ?? null}
    </div>
  )
}
