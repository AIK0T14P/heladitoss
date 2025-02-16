"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/ImageUpload"

interface TransferPaymentProps {
  alias: string
  orderTotal?: number
  onImageUpload: (file: File | null) => void
}

export function TransferPayment({ alias, orderTotal = 0, onImageUpload }: TransferPaymentProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyAlias = () => {
    navigator.clipboard.writeText(alias)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Detalles de Transferencia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Alias:</p>
          <div className="flex items-center">
            <p className="mr-2">{alias}</p>
            <Button onClick={handleCopyAlias} variant="outline" size="sm">
              {copied ? "Copiado!" : "Copiar"}
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <p className="font-semibold">Monto a transferir:</p>
          <p className="font-bold text-lg">ARS ${orderTotal.toLocaleString()}</p>
        </div>
        <div className="mt-4">
          <p className="font-semibold mb-2">Subir comprobante de transferencia:</p>
          <ImageUpload onImageUpload={onImageUpload} />
        </div>
      </CardContent>
    </Card>
  )
}
