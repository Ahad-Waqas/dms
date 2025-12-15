# Cesium 3D Map Integration

This project now includes Cesium.js for 3D visualization of disaster data across all disaster types (Earthquake, Flood, and Wildfire).

## Features

### Earthquake 3D Visualization
- 3D point markers with color-coded magnitude levels
- Interactive labels showing magnitude values
- Click on markers to view detailed information
- Depth visualization (earthquakes appear at their actual depth)

### Flood 3D Visualization
- Polygon rendering of flood-affected areas
- Severity-based color coding (minor, moderate, major)
- Interactive areas with detailed flood information
- Labels showing flood area names

### Wildfire 3D Visualization
- Polygon rendering of burned/affected areas
- Intensity-based color gradient
- Area calculations displayed
- Interactive regions with wildfire details

## How to Use

1. Navigate to the Disasters page
2. Select the Map View dropdown
3. Choose "Cesium 3D" from the options
4. The map will switch to a 3D globe view

## Controls

- **Left Click**: Select and view disaster details
- **Left Click + Drag**: Rotate the globe
- **Right Click + Drag**: Pan the view
- **Scroll Wheel**: Zoom in/out
- **Middle Click + Drag**: Rotate camera around point

## Configuration

### Cesium Ion Token
The default token is included, but you can get your own free token from:
https://cesium.com/ion/signup

Update the token in:
- `src/components/cesium/CesiumEarthquakeMap.tsx`
- `src/components/cesium/CesiumFloodMap.tsx`
- `src/components/cesium/CesiumWildfireMap.tsx`

### Custom Styling

Color schemes can be modified in each component:
- **Earthquakes**: `getMagnitudeColor()` function
- **Floods**: `getSeverityColor()` function
- **Wildfires**: `getIntensityColor()` function

## Technical Details

### Dependencies
- `cesium`: Core Cesium library
- `resium`: React wrapper for Cesium
- `copy-webpack-plugin`: For copying Cesium assets

### Components
- `CesiumEarthquakeMap.tsx`: Handles earthquake point data
- `CesiumFloodMap.tsx`: Handles flood polygon data
- `CesiumWildfireMap.tsx`: Handles wildfire polygon data

### Performance
- Components are lazy-loaded to reduce initial bundle size
- Cesium assets are served from static directory
- Only loads when "Cesium 3D" view is selected

## Troubleshooting

### Map not loading
- Check browser console for errors
- Verify Cesium assets are in `public/static/cesium/`
- Ensure Ion token is valid

### Poor performance
- Reduce the number of disasters shown using filters
- Use a more powerful GPU
- Close other browser tabs

### Styling issues
- Clear browser cache
- Check that Cesium CSS is properly imported
- Verify dark/light theme compatibility

## Future Enhancements

- Heat map support in 3D
- Clustering for large datasets
- Time-based animations
- Terrain integration for better depth visualization
- Custom camera flights to disaster locations
