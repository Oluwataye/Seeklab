"use client"

import { useEffect, useRef } from "react"
import { BarChart2 } from "lucide-react"

interface RevenueChartProps {
  title: string
  type: "monthly" | "yearly"
}

export default function RevenueChart({ title, type }: RevenueChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Draw chart based on type
    if (type === "monthly") {
      drawMonthlyChart(ctx, canvas.width, canvas.height)
    } else {
      drawYearlyChart(ctx, canvas.width, canvas.height)
    }
  }, [type])

  const drawMonthlyChart = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw grid lines
    ctx.strokeStyle = "#e5e7eb"
    ctx.beginPath()
    for (let i = 1; i < 5; i++) {
      const y = height - height * 0.2 * i
      ctx.moveTo(60, y)
      ctx.lineTo(width, y)
    }
    ctx.stroke()

    // Draw bars
    // Green bar
    ctx.fillStyle = "#4ade80"
    ctx.fillRect(width * 0.4, height * 0.3, 20, height * 0.7)

    // Blue bar
    ctx.fillStyle = "#60a5fa"
    ctx.fillRect(width * 0.6, height * 0.5, 20, height * 0.5)
  }

  const drawYearlyChart = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw grid lines
    ctx.strokeStyle = "#e5e7eb"
    ctx.beginPath()
    for (let i = 1; i < 5; i++) {
      const y = height - height * 0.2 * i
      ctx.moveTo(60, y)
      ctx.lineTo(width, y)
    }
    ctx.stroke()

    // January
    const janX = width * 0.15
    // Revenue
    ctx.fillStyle = "#ec4899"
    ctx.fillRect(janX, height * 0.95, 10, height * 0.05)
    // Expenses
    ctx.fillStyle = "#f87171"
    ctx.fillRect(janX + 12, height * 0.97, 10, height * 0.03)
    // Purchase
    ctx.fillStyle = "#4ade80"
    ctx.fillRect(janX + 24, height * 0.98, 10, height * 0.02)

    // February
    const febX = width * 0.45
    // Revenue
    ctx.fillStyle = "#ec4899"
    ctx.fillRect(febX, height * 0.9, 10, height * 0.1)
    // Expenses
    ctx.fillStyle = "#f87171"
    ctx.fillRect(febX + 12, height * 0.92, 10, height * 0.08)
    // Purchase
    ctx.fillStyle = "#4ade80"
    ctx.fillRect(febX + 24, height * 0.7, 10, height * 0.3)

    // March
    const marX = width * 0.75
    // Revenue
    ctx.fillStyle = "#ec4899"
    ctx.fillRect(marX, height * 0.4, 10, height * 0.6)
    // Expenses
    ctx.fillStyle = "#f87171"
    ctx.fillRect(marX + 12, height * 0.6, 10, height * 0.4)
    // Purchase
    ctx.fillStyle = "#4ade80"
    ctx.fillRect(marX + 24, height * 0.35, 10, height * 0.65)

    // Month labels
    ctx.fillStyle = "#000000"
    ctx.font = "10px Arial"
    ctx.textAlign = "center"
    ctx.fillText("JANUARY", janX + 12, height - 5)
    ctx.fillText("FEBRUARY", febX + 12, height - 5)
    ctx.fillText("MARCH", marX + 12, height - 5)
  }

  return (
    <div className="bg-white rounded-lg border mb-6">
      <div className="p-4 border-b">
        <h2 className="font-semibold flex items-center">
          <BarChart2 className="h-5 w-5 mr-2" />
          {title}
        </h2>
      </div>

      <div className="p-4 relative" style={{ height: type === "yearly" ? "300px" : "200px" }}>
        <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-500 py-4">
          <div>NGN8,000,000.00</div>
          <div>NGN6,000,000.00</div>
          <div>NGN4,000,000.00</div>
          <div>NGN2,000,000.00</div>
          <div>NGN0.00</div>
        </div>

        <div className="absolute left-16 right-0 top-0 bottom-0">
          <canvas ref={canvasRef} className="w-full h-full"></canvas>

          {type === "yearly" && (
            <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 flex items-center space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-pink-400 mr-1"></div>
                <span>REVENUE</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 mr-1"></div>
                <span>EXPENSES</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 mr-1"></div>
                <span>PURCHASE</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
