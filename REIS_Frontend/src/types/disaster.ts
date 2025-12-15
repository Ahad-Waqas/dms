export interface Disaster {
  id: string
  title: string
  type: string // "earthquake", "flood", "wildfire"
  description: string
  location: string
  latitude: number
  longitude: number
  severity: number // 1-10 scale
  date: string // ISO date string
  gdacs_id?: string
}
