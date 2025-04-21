"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"

interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (signatureData: string) => void
  title: string
}

export default function SignatureModal({ isOpen, onClose, onSave, title }: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)

  // Initialize canvas context
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (context) {
      context.lineWidth = 2
      context.lineCap = "round"
      context.strokeStyle = "#000000"
      setCtx(context)
    }

    // Clear canvas when modal opens
    if (isOpen && context) {
      context.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [isOpen])

  // Adjust canvas size to parent container
  useEffect(() => {
    if (!canvasRef.current || !isOpen) return

    const resizeCanvas = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const parent = canvas.parentElement
      if (!parent) return

      // Set canvas dimensions to match parent
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight

      // Restore context settings after resize
      const context = canvas.getContext("2d")
      if (context) {
        context.lineWidth = 2
        context.lineCap = "round"
        context.strokeStyle = "#000000"
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [isOpen])

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!ctx) return

    setIsDrawing(true)

    // Get coordinates
    const { offsetX, offsetY } = getCoordinates(e)

    // Start new path
    ctx.beginPath()
    ctx.moveTo(offsetX, offsetY)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx) return

    // Prevent scrolling on touch devices
    e.preventDefault()

    // Get coordinates
    const { offsetX, offsetY } = getCoordinates(e)

    // Draw line
    ctx.lineTo(offsetX, offsetY)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!ctx) return

    setIsDrawing(false)
    ctx.closePath()
  }

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { offsetX: 0, offsetY: 0 }

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    // Handle both mouse and touch events
    if ("touches" in e) {
      // Touch event
      const touch = e.touches[0]
      return {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top,
      }
    } else {
      // Mouse event
      return {
        offsetX: e.nativeEvent.offsetX,
        offsetY: e.nativeEvent.offsetY,
      }
    }
  }

  const clearSignature = () => {
    if (!ctx || !canvasRef.current) return
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  const saveSignature = () => {
    if (!canvasRef.current) return

    // Convert canvas to base64 image data
    const signatureData = canvasRef.current.toDataURL("image/png")

    // Pass data to parent component
    onSave(signatureData)

    // Close modal
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-[90%] max-w-md max-h-[80vh] flex flex-col">
        {/* Modal header */}
        <div className="p-4 border-b">
          <h2 className="text-center font-medium text-gray-800">{title}</h2>
        </div>

        {/* Signature canvas area */}
        <div className="flex-1 relative border-b min-h-[300px]">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {/* Action buttons */}
        <div className="p-4 space-y-2">
          <button
            className="w-full bg-[#6A8D73] hover:bg-[#5a7a62] text-white rounded-lg py-3 transition-colors"
            onClick={saveSignature}
          >
            Aceptar
          </button>

          <button className="w-full text-gray-600 py-2 text-sm" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
