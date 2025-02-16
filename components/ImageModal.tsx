"use client"

import React from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ImageModalProps {
  imageUrl: string
}

export function ImageModal({ imageUrl }: ImageModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Ver comprobante de transferencia</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <div className="mt-4">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt="Comprobante de transferencia"
            width={400}
            height={400}
            className="rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

