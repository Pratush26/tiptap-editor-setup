"use client"

import type { JSONContent } from "@tiptap/core"
import type { JSX } from "react"
import "@/components/tiptap-templates/simple/simple-editor-preview.scss"

interface SimpleEditorPreviewProps {
  content: JSONContent | string
  className?: string
  textScale?: number
}

function renderNode(node: JSONContent, index: number): React.ReactNode {
  if (!node) return null

  const children = node.content?.map((child, i) => renderNode(child, i)) ?? []

  switch (node.type) {
    case "heading": {
      const level = node.attrs?.level ?? 1
      const Tag = `h${level}` as keyof JSX.IntrinsicElements
      const sizeClass =
        level === 1
          ? "text-3xl sm:text-4xl font-extrabold"
          : level === 2
            ? "text-2xl sm:text-3xl font-bold"
            : level === 3
              ? "text-xl sm:text-2xl font-bold"
              : "text-lg sm:text-xl font-semibold"
      return (
        <Tag key={index} className={`${sizeClass} text-gray-900 mt-8 mb-3`}>
          {children}
        </Tag>
      )
    }

    case "paragraph":
      return (
        <p
          key={index}
          className="text-gray-700 text-base sm:text-lg leading-relaxed mb-4"
        >
          {children}
        </p>
      )

    case "bulletList":
      return (
        <ul
          key={index}
          className="list-disc pl-6 mb-4 space-y-1 text-gray-700 text-base sm:text-lg"
        >
          {children}
        </ul>
      )

    case "orderedList":
      return (
        <ol
          key={index}
          className="list-decimal pl-6 mb-4 space-y-1 text-gray-700 text-base sm:text-lg"
        >
          {children}
        </ol>
      )

    case "listItem":
      return <li key={index}>{children}</li>

    case "taskList":
      return (
        <ul key={index} className="mb-4 space-y-1">
          {node.content?.map((item, i) => {
            const checked = item.content?.[0]?.attrs?.checked ?? false
            const text = item.content?.[1]?.content ?? []
            return (
              <li
                key={i}
                className="flex items-start gap-2 text-gray-700 text-base sm:text-lg"
              >
                <span
                  className={`mt-1.5 h-4 w-4 shrink-0 rounded border ${
                    checked
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300"
                  }`}
                />
                {checked ? (
                  <span className="line-through text-gray-400">
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
      return (
        <blockquote
          key={index}
          className="border-l-4 border-gray-300 pl-4 my-6 text-gray-500 italic text-base sm:text-lg"
        >
          {children}
        </blockquote>
      )

    case "codeBlock": {
      const code = node.content?.map((c) => c.text ?? "").join("") ?? ""
      return (
        <pre
          key={index}
          className="bg-gray-950 text-gray-100 rounded-lg p-4 my-4 overflow-x-auto text-sm leading-relaxed"
        >
          <code>{code}</code>
        </pre>
      )
    }

    case "horizontalRule":
      return <hr key={index} className="my-8 border-gray-200" />

    case "image": {
      const src = node.attrs?.src ?? ""
      const alt = node.attrs?.alt ?? ""
      return (
        <figure key={index} className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="w-full rounded-lg object-cover"
          />
          {alt && (
            <figcaption className="text-center text-sm text-gray-400 mt-2">
              {alt}
            </figcaption>
          )}
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
        className={`simple-editor-preview-content w-full text-base sm:text-lg leading-relaxed ${className ?? ""}`}
        style={{ zoom: textScale }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return (
    <div className={`w-full ${className ?? ""}`} style={{ zoom: textScale }}>
      {content.content?.map((node, i) => renderNode(node, i)) ?? null}
    </div>
  )
}
