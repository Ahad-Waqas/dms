"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, MapPinIcon, AlertTriangleIcon, InfoIcon, DatabaseIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Disaster } from "@/types/disaster"

interface FloodDisasterModalProps {
  isOpen: boolean
  onClose: () => void
  disaster: Disaster | null
}

export function FloodDisasterModal({ isOpen, onClose, disaster }: FloodDisasterModalProps) {
  if (!disaster) return null

  const getTypeColor = () => {
    return "bg-blue-100 text-blue-800 hover:bg-blue-100/80"
  }

  const getSeverityColor = (severity: string | number) => {
    if (typeof severity === 'string') {
      switch (severity) {
        case 'severe': return "bg-red-500"
        case 'moderate': return "bg-orange-500"
        case 'minor': return "bg-blue-500"
        default: return "bg-blue-300"
      }
    } else {
      // For numeric severity (backward compatibility)
      if (severity >= 8) return "bg-red-500"
      if (severity >= 6) return "bg-orange-500"
      if (severity >= 4) return "bg-yellow-500"
      return "bg-green-500"
    }
  }

  const getProgressWidth = (severity: string | number) => {
    if (typeof severity === 'string') {
      switch (severity) {
        case 'severe': return '90%'
        case 'moderate': return '70%'
        case 'minor': return '40%'
        default: return '30%'
      }
    } else {
      // For numeric severity (backward compatibility)
      return `${Math.min(100, severity * 10)}%`
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{disaster.title}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={getTypeColor()}>
                Flood
              </Badge>
              <span className="text-xs text-muted-foreground">
                <CalendarIcon className="inline-block w-3 h-3 mr-1" />
                {formatDistanceToNow(new Date(disaster.date), { addSuffix: true })}
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-[20px_1fr] items-start gap-2">
            <MapPinIcon className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Location</p>
              <p className="text-sm text-muted-foreground">
                {disaster.location}
                <br />
                Lat: {disaster.latitude.toFixed(6)}, Lon: {disaster.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[20px_1fr] items-start gap-2">
            <AlertTriangleIcon className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Severity</p>
              <div className="flex items-center gap-2">
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getSeverityColor(disaster.severity)}`}
                    style={{ width: getProgressWidth(disaster.severity) }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {typeof disaster.severity === 'string' 
                    ? disaster.severity.charAt(0).toUpperCase() + disaster.severity.slice(1) 
                    : disaster.severity >= 8 ? "Extreme" : disaster.severity >= 6 ? "Severe" : disaster.severity >= 4 ? "Moderate" : "Minor"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[20px_1fr] items-start gap-2">
            <DatabaseIcon className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Source</p>
              <p className="text-sm text-muted-foreground">
                {disaster.location} 
              </p>
              <p className="text-xs text-muted-foreground">
                ID: {disaster.id.substring(0, 8)}...
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[20px_1fr] items-start gap-2">
            <InfoIcon className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Details</p>
              <p className="text-sm text-muted-foreground">{disaster.description}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}