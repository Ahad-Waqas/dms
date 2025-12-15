export interface FireDisaster {
  wildfire_id: string
  gdacs_id: string
  severity_level: 'minor' | 'moderate' | 'major' | 'catastrophic'
  reported_at: string // ISO 8601 date string
  source: string
  epicenter: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
}
