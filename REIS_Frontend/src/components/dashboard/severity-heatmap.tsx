"use client"
import { ChartContainer } from "@/components/ui/chart"

interface SeverityHeatmapProps {
  data: any[]
}

export default function SeverityHeatmap({ data }: SeverityHeatmapProps) {
  // Define chart configuration
  const config: Record<string, any> = {
    earthquake: {
      label: "Earthquakes",
      color: "hsl(var(--chart-1))",
    },
    flood: {
      label: "Floods",
      color: "hsl(var(--chart-2))",
    },
    wildfire: {
      label: "Wildfires",
      color: "hsl(var(--chart-3))",
    },
  }

  // Create a custom heatmap visualization
  return (
    <ChartContainer config={config} className="w-full h-full">
      <div className="w-full h-full flex flex-col">
        <div className="flex mb-2">
          <div className="w-20"></div>
          {data[0].months.map((month: string, index: number) => (
            <div key={index} className="flex-1 text-center text-xs font-medium">
              {month}
            </div>
          ))}
        </div>
        {data.map((row: any, rowIndex: number) => (
          <div key={rowIndex} className="flex flex-1 mb-1">
            <div className="w-20 flex items-center text-xs font-medium">{row.type}</div>
            <div className="flex-1 flex">
              {row.values.map((value: number, colIndex: number) => {
                // Calculate color based on severity (0-10 scale)
                const intensity = Math.min(value / 10, 1)
                let backgroundColor

                if (row.type === "Earthquake") {
                  backgroundColor = `rgba(255, ${Math.round(255 - intensity * 255)}, ${Math.round(255 - intensity * 255)}, ${0.7 + intensity * 0.3})`
                } else if (row.type === "Flood") {
                  backgroundColor = `rgba(${Math.round(255 - intensity * 255)}, ${Math.round(255 - intensity * 255)}, 255, ${0.7 + intensity * 0.3})`
                } else if (row.type === "Wildfire") {
                  backgroundColor = `rgba(255, ${Math.round(165 - intensity * 165)}, ${Math.round(255 - intensity * 255)}, ${0.7 + intensity * 0.3})`
                }

                return (
                  <div
                    key={colIndex}
                    className="flex-1 mx-0.5 rounded flex items-center justify-center text-xs font-medium"
                    style={{
                      backgroundColor,
                      height: "100%",
                      color: intensity > 0.5 ? "white" : "black",
                    }}
                    title={`${row.type} - ${data[0].months[colIndex]}: ${value.toFixed(1)}`}
                  >
                    {value.toFixed(1)}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div className="mt-4 flex items-center justify-center">
          <div className="flex h-2 w-64">
            {Array.from({ length: 20 }).map((_, i) => {
              const intensity = i / 19
              return (
                <div
                  key={i}
                  className="flex-1"
                  style={{
                    backgroundColor: `rgba(255, ${Math.round(255 - intensity * 255)}, ${Math.round(255 - intensity * 255)}, 1)`,
                    height: "100%",
                  }}
                />
              )
            })}
          </div>
          <div className="flex justify-between w-64 text-xs text-muted-foreground mt-1">
            <span>Low</span>
            <span>Severity</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </ChartContainer>
  )
}
