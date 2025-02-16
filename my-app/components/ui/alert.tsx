import React from "react"
import { AlertCircle } from "lucide-react"

interface AlertProps {
  title: string
  description: string
}

export function Alert({ title, description }: AlertProps) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <strong className="font-bold">{title}</strong>
      </div>
      <span className="block sm:inline">{description}</span>
    </div>
  )
}

