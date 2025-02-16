"use client"

import type React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface SortableItemProps {
  id: string
  children: React.ReactNode
  onRemove: (id: string) => void
}

export function SortableItem({ id, children, onRemove }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRemove(id)
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
        <span>{children}</span>
        <button
          onClick={handleRemove}
          className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
          {...attributes}
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}

