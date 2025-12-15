# REIS (Real-time Emergency Information System) - User Manual

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Authentication](#user-authentication)
4. [Dashboard Overview](#dashboard-overview)
5. [Home Page](#home-page)
6. [Disaster Map](#disaster-map)
7. [Reports](#reports)
8. [Features by Disaster Type](#features-by-disaster-type)
9. [Advanced Features](#advanced-features)
10. [Troubleshooting](#troubleshooting)
11. [Tips and Best Practices](#tips-and-best-practices)

---

## 1. Introduction

### What is REIS?
REIS (Real-time Emergency Information System) is a comprehensive disaster monitoring and analysis platform that provides real-time information about natural disasters worldwide. The system integrates data from multiple sources including USGS (earthquakes), GDACS (Global Disaster Alert and Coordination System), and other disaster monitoring agencies.

### Key Features
- **Real-time Disaster Monitoring**: Track earthquakes, floods, and wildfires as they happen
- **Interactive Maps**: Multiple visualization options including heatmaps, markers, clusters, and polygons
- **Advanced Filtering**: Filter disasters by location, magnitude, time range, and severity
- **Risk Assessment**: Premium feature for flood risk calculation in specific areas
- **Detailed Reports**: AI-generated comprehensive reports for major disaster events
- **Multiple Map Views**: Streets, satellite, and terrain views available

### Supported Disaster Types
1. **Earthquakes** - Magnitude, depth, location, and aftershock data
2. **Floods** - Severity levels, affected areas, and risk predictions
3. **Wildfires** - Intensity, spread patterns, and affected regions

---

## 2. Getting Started

### System Requirements
- **Browser**: Modern web browser (Chrome, Firefox, Safari, or Edge)
- **Internet Connection**: Stable internet connection for real-time data
- **Screen Resolution**: Minimum 1024x768 (recommended 1920x1080)

### Accessing the Application
1. Open your web browser
2. Navigate to the application URL (provided by your administrator)
3. You will be directed to the login page

### First Time Setup
1. Obtain login credentials from your system administrator
2. Log in using your email and password
3. The system will store your preferences locally
4. Navigate through the dashboard to familiarize yourself with the interface

---

## 3. User Authentication

### Login Process

#### Step 1: Navigate to Login Page
- When you first access the application, you'll see the login screen
- The page displays "Welcome back" with the IDARA branding

#### Step 2: Enter Credentials
1. **Email Field**
   - Enter your registered email address
   - Format: username@example.com
   - This field is required

2. **Password Field**
   - Enter your password
   - Password is masked for security
   - Click "Forgot your password?" link if needed

3. **Remember Me Option**
   - Check the "Remember me" box to stay logged in
   - Your session will persist across browser sessions
   - Unchecking will require login each time

#### Step 3: Submit
- Click the "Login" button
- Wait for authentication (loading indicator will appear)
- Upon successful login, you'll be redirected to the dashboard

### Login Errors
- **"Invalid email or password"**: Check your credentials and try again
- **"Login failed"**: Network issue or server error - wait and retry
- **Account locked**: Contact your administrator

### Forgot Password
- Click "Forgot your password?" link on the login page
- Follow the password recovery process
- Contact support if you don't receive recovery email

### Session Management
- Your session is stored locally when "Remember me" is checked
- Logging in again will clear previous session data
- For security, log out when using shared computers

---

## 4. Dashboard Overview

### Dashboard Layout

The dashboard consists of three main sections accessible via the sidebar:

#### Sidebar Navigation
Located on the left side of the screen, collapsible for more screen space:

1. **Home** (🏠 icon)
   - Default landing page after login
   - Displays top 5 GDACS alerts
   - Quick overview of current global disasters

2. **Disaster Map** (🗺️ icon)
   - Interactive mapping interface
   - Main feature for disaster visualization
   - Multiple disaster type tabs

3. **Reports** (📅 icon)
   - Detailed disaster event reports
   - AI-generated analysis
   - Historical data and impact assessment

#### Sidebar Controls
- **Collapse/Expand**: Click the menu icon to toggle sidebar width
- **Icon-only mode**: Collapsed sidebar shows only icons
- **Fixed position**: Sidebar remains visible while scrolling

### Theme Options
- The application supports both light and dark themes
- Toggle between themes using the theme button (if available)
- Your preference is saved automatically

### Navigation Tips
- Use the sidebar to quickly switch between sections
- The current page is highlighted in the sidebar
- All navigation is instant without page reloads

---

## 5. Home Page

### Overview
The Home page provides a quick snapshot of the most critical disaster alerts worldwide, featuring an interactive 3D Earth visualization with real-time disaster monitoring capabilities.

### Interactive 3D Earth Animation

#### What is the 3D Earth?
The landing page features a stunning, interactive 3D globe that showcases Earth with realistic day/night textures, atmospheric effects, and dynamic lighting. This immersive visualization sets the tone for the disaster monitoring experience.

#### Features of the 3D Earth

**Visual Elements**:
- **Realistic Earth Textures**: High-resolution day and night textures showing continents, oceans, and city lights
- **Atmospheric Glow**: Blue atmospheric halo around the planet mimicking Earth's atmosphere
- **Dynamic Lighting**: Simulated sun direction creating realistic day/night transitions
- **Cloud Layers**: Specular cloud textures adding depth and realism
- **Snowfall Effect**: Animated snowfall particles creating a winter ambiance

**Interactive Animation**:
- **Auto-rotation**: The Earth continuously rotates, giving a dynamic view of the planet
- **Scroll-triggered Zoom**: As you scroll down the page:
  - The Earth gradually zooms in closer
  - Text fades out with a blur effect
  - The "Explore REIS Dashboard" button scales up
  - Camera position smoothly transitions from distant view to close-up
  
**Technical Highlights**:
- Built with Three.js for high-performance 3D rendering
- WebGL-powered graphics for smooth animations
- Responsive design adapts to different screen sizes
- Custom shader programming for realistic lighting effects

#### Interacting with the Home Page

1. **Initial View**:
   - See the complete Earth from a distance
   - Read the title "REIS" and description
   - Notice the gentle rotation of the planet

2. **Scroll Interaction**:
   - Scroll down to trigger the zoom animation
   - Watch as the Earth approaches the camera
   - Text content fades away smoothly
   - Button remains prominent for easy access

3. **Navigation**:
   - Click "Explore REIS Dashboard" button at any time
   - Button redirects you to the main dashboard
   - Animation provides engaging transition experience

#### Why the 3D Earth?
The 3D Earth animation serves multiple purposes:
- **Visual Impact**: Creates an impressive first impression
- **Context**: Reminds users of the global nature of disaster monitoring
- **Engagement**: Interactive elements encourage exploration
- **Branding**: Establishes REIS as a modern, technology-forward platform

### Top 5 GDACS Alerts

#### What are GDACS Alerts?
GDACS (Global Disaster Alert and Coordination System) provides real-time alerts for major disasters worldwide based on their severity and impact.

#### Alert Display Format
Each alert card shows:

1. **Title**: Name and type of disaster
2. **Description**: Brief summary of the event
3. **Location**: Country and coordinates (🌍 icon)
4. **Alert Level**: Color-coded severity indicator (🟢)
   - Green: Minor
   - Yellow: Moderate
   - Orange: Severe
   - Red: Extreme

5. **Visual Aid**: Map or satellite imagery when available
6. **Read More Link**: External link to detailed GDACS report

#### Interacting with Alerts
- **Click "Read more"**: Opens official GDACS report in new tab
- **View location**: Coordinates show exact disaster location
- **Check images**: View satellite imagery or event maps
- **Note timing**: Alerts are updated in real-time

#### Navigation to Detailed View
- Click "View all alerts" link at the top
- This redirects you to the Disaster Map page
- Filter and explore more disasters beyond the top 5

### Understanding Alert Levels

**Green (Low)**
- Minor disaster with limited impact
- Local response sufficient
- Monitoring recommended

**Yellow (Moderate)**
- Moderate impact expected
- Regional coordination may be needed
- Preparation advised

**Orange (Severe)**
- Significant impact
- International assistance may be required
- High alert status

**Red (Extreme)**
- Catastrophic disaster
- Major international response needed
- Emergency protocols activated

---

## 6. Disaster Map

### Overview
The Disaster Map is the core feature of REIS, providing interactive visualization of disasters worldwide.

### Page Layout

**Note**: The Disaster Map uses advanced dynamic loading techniques to optimize performance. Map components, especially the CesiumJS 3D views, are loaded on-demand to reduce initial page load time and improve responsiveness.

#### Top Section - Header
- **Page Title**: "Disasters"
- **Instructions**: "Please select a disaster type from down below to view the corresponding map"

#### Filter Section
Left side of the page:
- **Filter Button**: "Filter [Disaster Type]" button
  - Changes based on selected disaster tab
  - Opens filter dialog when clicked
  
Right side of the page:
- **Map Type Selector**: Choose visualization style
- **Map View Selector**: Choose map background

#### Tab Navigation
Three tabs for different disaster types:
1. **Earthquake Tab**
2. **Flood Tab**
3. **Wildfire Tab**

#### Map Display Area
Large interactive map showing selected disaster data (700px height)

---

### Map Type Options

REIS offers multiple map visualization types, including traditional 2D views and an advanced 3D globe powered by CesiumJS.

#### 1. Cesium 3D Globe View
**Best for**: Immersive 3D visualization and terrain analysis

**What is CesiumJS?**
CesiumJS is an open-source JavaScript library for creating 3D globes and maps. It provides photorealistic, high-performance 3D visualization of geospatial data with support for terrain, imagery, and advanced rendering techniques.

**Features**:
- **3D Globe Rendering**: View Earth as a realistic 3D sphere
- **Terrain Visualization**: See elevation data and topographical features
- **Smooth Navigation**: Rotate, zoom, and tilt the globe freely
- **Multiple Imagery Layers**: Switch between satellite, streets, and terrain imagery
- **Photorealistic Views**: High-quality satellite imagery with smooth transitions
- **Performance Optimized**: Hardware-accelerated rendering for smooth interaction

**Available for**:
- Earthquake visualization (CesiumEarthquakeMap)
- Flood monitoring (CesiumFloodMap)
- Wildfire tracking (CesiumWildfireMap)
- General disaster mapping (CesiumMap)

**How to Use**:
1. Select the disaster type (Earthquake, Flood, or Wildfire)
2. Choose "Cesium" from the Map Type selector
3. Wait for the 3D globe to load
4. Interact with the globe:
   - **Left-click and drag**: Rotate the globe
   - **Right-click and drag**: Pan the view
   - **Scroll wheel**: Zoom in and out
   - **Middle-click and drag**: Tilt the camera angle

**3D Visualization Benefits**:
- **Spatial Understanding**: Better grasp of disaster locations in 3D space
- **Terrain Context**: See how mountains, valleys, and elevation affect disasters
- **Global Perspective**: Understand disaster distribution across continents
- **Immersive Experience**: More engaging than flat 2D maps
- **Precise Navigation**: Easily navigate to any location on Earth

**Data Display on Cesium Globe**:
- Disaster events appear as 3D markers or entities
- Click on markers to see detailed information
- Markers are positioned at exact geographic coordinates
- Height can represent magnitude or severity
- Color coding indicates disaster type or intensity

**Technical Details**:
- Uses Cesium Ion for imagery and terrain data
- Supports Web Graphics Library (WebGL) for 3D rendering
- Automatically adjusts quality based on device capabilities
- Terrain data from multiple global sources
- Satellite imagery updated regularly

**Best Practices**:
- Use 3D view for regional analysis and terrain-dependent disasters
- Switch to 2D views for dense data sets that may clutter 3D space
- Allow time for initial load, especially on slower connections
- Use terrain view to understand earthquake and flood patterns
- Tilt the camera to see elevation differences more clearly

**System Requirements**:
- WebGL-capable browser (modern Chrome, Firefox, Safari, or Edge)
- Sufficient GPU for 3D rendering
- Stable internet connection for loading terrain and imagery tiles
- Recommended: Dedicated graphics card for best performance

#### 2. Heatmap View
**Best for**: Identifying disaster concentration areas

**Features**:
- Color gradient shows density
- Red = High concentration
- Yellow = Medium concentration
- Green/Blue = Low concentration
- Smooth transitions between areas

**Use Cases**:
- Identify high-risk zones
- Spot patterns in disaster occurrence
- Analyze regional trends

**How to Read**:
- Brighter, warmer colors = more disasters
- Larger radius = higher magnitude/severity
- Overlapping areas show cluster patterns

#### 3. Markers View
**Best for**: Individual disaster identification

**Features**:
- Each disaster shown as a pin/marker
- Click marker for detailed information
- Different colors for severity levels
- Precise location indication

**Use Cases**:
- Find specific disaster events
- Get exact coordinates
- See individual disaster details

**Interaction**:
- Click marker to open popup
- Popup shows: magnitude, time, location, depth
- Multiple markers clustered when zoomed out

#### 4. Clusters View
**Best for**: Managing large datasets

**Features**:
- Groups nearby disasters together
- Shows number of disasters in cluster
- Expands when zoomed in
- Prevents map clutter

**Use Cases**:
- Overview of disaster distribution
- Handling hundreds of data points
- Progressive detail revelation

**How It Works**:
- Numbers indicate disasters in cluster
- Click cluster to zoom and expand
- Keeps zooming/clicking until individual markers appear

#### 5. Polygons View
**Best for**: Area-based analysis

**Features**:
- Shows affected regions as shapes
- Boundaries of disaster impact zones
- Color-coded by severity
- Area calculations visible

**Use Cases**:
- Assess impact zones
- Plan evacuation areas
- Understand disaster spread

---

### Map View Options

#### 1. Streets View
**Description**: Traditional street map with roads, cities, and landmarks

**Features**:
- Clear road networks
- City and place names
- Topographical features
- Political boundaries

**Best For**:
- Urban disaster analysis
- Navigation planning
- Infrastructure assessment
- Understanding accessible routes

#### 2. Satellite View
**Description**: Real aerial/satellite imagery

**Features**:
- Actual satellite photos
- Terrain features visible
- Vegetation patterns
- Building structures

**Best For**:
- Visual damage assessment
- Rural area analysis
- Understanding terrain
- Before/after comparisons

#### 3. Terrain View
**Description**: Topographical map showing elevation and landscape

**Features**:
- Elevation contours
- Mountain ranges
- Valleys and hills
- Terrain shading

**Best For**:
- Analyzing earthquake patterns
- Flood risk assessment
- Understanding geography
- Avalanche/landslide risks

---

### Earthquake Monitoring

#### Accessing Earthquake Data
1. Click the **Earthquake** tab
2. Default view loads recent earthquake data
3. Map displays worldwide seismic activity

#### Understanding Earthquake Data

**Each Earthquake Shows**:
- **Magnitude**: Richter scale measurement (e.g., 6.8)
- **Depth**: How deep underground (in km)
- **Location**: Geographic coordinates
- **Time**: When the earthquake occurred
- **Place**: Nearest city or region
- **USGS ID**: Official identifier

#### Earthquake Filtering

**Opening the Filter Dialog**:
1. Click "Filter Earthquakes" button
2. Dialog opens with multiple filter options
3. Scroll through available filters

**Filter Options**:

**1. Magnitude Range**
- **Min Magnitude**: Minimum earthquake strength
- **Max Magnitude**: Maximum earthquake strength
- Example: Filter for 5.0 - 7.0 shows moderate to strong quakes
- Leave blank to include all magnitudes

**2. Depth Range**
- **Min Depth**: Shallowest depth (km)
- **Max Depth**: Deepest depth (km)
- Shallow quakes (0-70km) often cause more damage
- Deep quakes (>300km) less surface impact

**3. Geographic Boundaries**
- **Min/Max Latitude**: North-South range
- **Min/Max Longitude**: East-West range
- Can manually enter coordinates
- Or use Map Selector (recommended)

**4. Time Range**
- **Start Time**: Beginning of time period
- **End Time**: End of time period
- Format: YYYY-MM-DD or use date picker
- Leave blank for all-time data

**Using the Map Selector**:
1. Scroll to bottom of filter dialog
2. Interactive map appears
3. **First Click**: Set northwest corner
4. **Second Click**: Set southeast corner
5. Blue rectangle shows selected area
6. Coordinates auto-populate in filter fields
7. Click "Apply Coordinates" to confirm

**Applying Filters**:
1. Review all selected filter values
2. Click "Continue" button at bottom
3. Dialog closes
4. Map updates with filtered data
5. Toast notification confirms success

**Filter Results**:
- **Success**: "Earthquake data found for the selected filters"
- **No Results**: "No earthquake data found for the selected filters"
- **Map Updates**: Only matching earthquakes display

**Resetting Filters**:
- Filters are automatically cleared after submission
- To see all data again, reload the page
- Or apply new filters with wider parameters

#### Earthquake Data Interpretation

**Magnitude Scale**:
- **< 3.0**: Micro - Not felt
- **3.0 - 3.9**: Minor - Often felt, rarely causes damage
- **4.0 - 4.9**: Light - Noticeable shaking, minimal damage
- **5.0 - 5.9**: Moderate - Damage to poorly constructed buildings
- **6.0 - 6.9**: Strong - Destructive in populated areas
- **7.0 - 7.9**: Major - Serious damage over large areas
- **8.0+**: Great - Can destroy communities

**Depth Categories**:
- **0-70 km**: Shallow - Most damaging
- **70-300 km**: Intermediate
- **300+ km**: Deep - Less surface impact

---

### Flood Monitoring

#### Accessing Flood Data
1. Click the **Flood** tab
2. System loads last 20 flood events by default
3. Map displays flood-affected areas

#### Understanding Flood Data

**Each Flood Event Shows**:
- **Location**: Geographic coordinates
- **Severity Level**: Low, Moderate, High, Severe
- **Time**: When flood was detected
- **Affected Area**: Region or administrative boundary
- **Water Level**: If available

#### Flood Filtering

**Opening the Filter Dialog**:
1. Click "Filter Floods" button
2. Dialog opens with flood-specific filters

**Filter Options**:

**1. Time Range**
- **Start Time**: Beginning date/time
- **End Time**: End date/time
- Filter floods within specific period
- Useful for seasonal analysis

**2. Geographic Boundaries**
- **Min/Max Latitude**: North-South boundaries
- **Min/Max Longitude**: East-West boundaries
- Use Map Selector for visual selection

**3. Severity Level**
- Dropdown selection
- Options: Low, Moderate, High, Severe, Extreme
- Filter by impact level
- Multiple selections possible

**Using Map Selector for Floods**:
1. Same process as earthquake map selector
2. Click two points to define rectangle
3. Selected area highlighted
4. Coordinates auto-filled

**Applying Filters**:
1. Set desired filter values
2. Click "Continue"
3. Map updates with filtered flood data
4. Success/error notification appears

#### Flood Risk Calculation (Premium Feature)

**Accessing Risk Calculator**:
1. Scroll down in Flood tab
2. Section titled "Risk calculation"
3. **Login Required**: Must be authenticated user
4. If not logged in: "This is a premium feature. Please login to your account to access it"

**How to Calculate Flood Risk**:

**Step 1: Login Check**
- Ensure you're logged in
- Your user_id must be stored in browser

**Step 2: Select Area**
1. Interactive map displays
2. Click "Select Area on Map" or similar button
3. Click two points on map to define rectangular area
4. **Maximum Area**: 5.5 square degrees
5. Error shows if area too large: "Selected area exceeds maximum allowed"

**Step 3: Submit Request**
1. Review selected coordinates
2. Click "Calculate Risk" or submit button
3. Loading indicator appears
4. Wait for API response (may take 30-60 seconds)

**Step 4: View Results**
- Risk score displays
- Color-coded risk level:
  - Green: Low risk
  - Yellow: Moderate risk
  - Orange: High risk
  - Red: Severe risk
- Additional metrics may include:
  - Historical flood frequency
  - Elevation data
  - Proximity to water bodies
  - Soil type and drainage

**Understanding Risk Scores**:
- **0-20**: Minimal risk
- **21-40**: Low risk
- **41-60**: Moderate risk
- **61-80**: High risk
- **81-100**: Severe risk

**Limitations**:
- Maximum area: 5.5 square degrees
- Requires authentication
- Processing time depends on area size
- Data availability varies by region

---

### Wildfire Monitoring

#### Accessing Wildfire Data
1. Click the **Wildfire** tab
2. Last 20 wildfire events load by default
3. Map shows active and recent fires

#### Understanding Wildfire Data

**Each Wildfire Event Shows**:
- **Location**: Fire coordinates
- **Intensity/Severity**: Fire strength level
- **Detection Time**: When fire was identified
- **Affected Area**: Square kilometers
- **Confidence Level**: Satellite detection confidence

#### Wildfire Filtering

**Opening the Filter Dialog**:
1. Click "Filter Wildfires" button
2. Dialog with wildfire-specific options opens

**Filter Options**:

**1. Intensity/Severity Level**
- Minimum intensity threshold
- Filters out smaller fires
- Options: Low, Moderate, High, Severe

**2. Date Range**
- **Min Date (Start Time)**: Earliest date
- **Max Date (End Time)**: Latest date
- Format: Date picker or manual entry

**3. Geographic Boundaries**
- **Latitude Range**: Min and Max
- **Longitude Range**: Min and Max
- Use Map Selector for precision

**Using Map Selector**:
1. Interactive map in filter dialog
2. Two-click selection process
3. Rectangle defines search area
4. Coordinates auto-populate

**Filter Field Mapping**:
The system maps user-friendly names to API parameters:
- "minIntensity" → severity_level
- "minDate" → start_time
- "maxDate" → end_time
- "minLatitude" → min_lat
- "maxLatitude" → max_lat
- "minLongitude" → min_lon
- "maxLongitude" → max_lon

**Applying Filters**:
1. Configure all desired filters
2. Click "Continue"
3. Data refreshes with filtered results
4. Notification shows success or errors

**Results Interpretation**:
- **Success**: "Wildfire data found for the selected filters"
- **No Results**: "No wildfire data found for the selected filters"
- Empty map if no matches

---

## 7. Reports

### Overview
The Reports section provides detailed, comprehensive analysis of major disaster events using data from GDACS and AI-generated insights.

### Accessing Reports

#### From GDACS Alerts
1. Go to Home page
2. Find a disaster alert of interest
3. Note the GDACS ID and disaster type
4. Click to navigate to reports

#### Direct Navigation
1. Use sidebar to click "Reports"
2. URL requires parameters:
   - `gdacs_id`: Unique disaster identifier
   - `type`: Disaster type (FLOOD, EARTHQUAKE, etc.)

#### URL Format
```
/dashboard/reports?gdacs_id=1234567&type=FLOOD
```

### Initial Report Request

When you first access a report page, you'll see a form:

#### Step 1: Verify Information
- **GDACS ID**: Pre-filled, read-only
- **Disaster Type**: Pre-filled, read-only
- These come from URL parameters

#### Step 2: Choose Report Option

**Option A: Get Existing Report**
1. Click "Get Existing Report" button
2. System searches for previously generated report
3. If found: Report displays immediately
4. If not found: Error message appears with option to generate

**Option B: Generate New Report**
1. Appears if existing report not found
2. Click "Generate New Report" button
3. System creates fresh analysis
4. Processing time: 10-30 seconds
5. New report displays when ready

#### Authentication Check
- System verifies user_id from localStorage
- If not logged in: Redirected to login page
- Login required for report access

---

### Report Structure

Once loaded, reports contain multiple sections organized in tabs:

### Header Section

**Top Banner (Color-Coded by Alert Level)**:
- **Visual Alert Indicator**: Colored background matching severity
  - Green: Minor event
  - Yellow: Moderate
  - Orange: Severe
  - Red: Extreme

- **Disaster Icon**: Left side shows disaster type icon
- **Event Name**: Large bold title
- **Description**: Brief summary below title
- **Alert Level Badge**: Right side displays alert level

**Metadata Bar**:
- **User ID**: Your account identifier
- **GDACS ID**: Official event identifier
- **Type**: Disaster category

---

### Event Summary Tab

**Overview Card** includes:

**1. Event Details**
- **Event ID**: Unique identifier
- **Location Icon** (📍): Country name and ISO3 code
- **Calendar Icon** (📅): 
  - Start date and time
  - End date and time
  - Duration calculation

**2. Active Status Alert**
- Alert box with warning icon
- "This is an active disaster event" or "This disaster event has ended"
- Color-coded: Orange for active, Gray for ended

**3. Location Information Grid**
- **Left Box**: 
  - Label: "Location"
  - Coordinates: Latitude, Longitude
  - Exact decimal degree format
  
- **Right Box**:
  - Label: "Data Source"
  - Source organization (GDACS, etc.)

**4. Summary Text**
- Detailed description of event
- Context and background
- Current situation
- Expected developments

**5. Last Updated Timestamp**
- Footer shows: "Last updated: [Date and Time]"
- Format: Month DD, YYYY at HH:MM AM/PM

---

### Impact Data Tab

**Purpose**: Analyze the human and material impact of the disaster

#### People Affected Section

**Header**: "People Affected" with users icon (👥)

**Sendai Framework Data**:
For each reported impact:

**1. Impact Card** (gray background):
- **Top Row**:
  - Left: "X people affected" (bold)
  - Right: Region badge
  
- **Middle Section**:
  - Detailed description of impact
  - Specific affected populations
  - Displacement information
  - Casualties (if applicable)

- **Bottom Row**:
  - "Reported: [Date and Time]"
  - Small gray text

**2. Multiple Impact Reports**:
- Different regions show separate cards
- Chronologically organized
- Updates appear as new data arrives

**3. No Data Message**:
- If no impact data available:
- "No detailed impact data available"
- Centered message in gray

#### Understanding Sendai Framework
- International standard for disaster reporting
- Tracks displaced persons, casualties, affected populations
- Regional breakdown available
- Time-stamped for accuracy

---

### Maps & Imagery Tab

**Purpose**: Visual representation of disaster extent and impact

#### Available Maps

**1. Overview Map**
- **Description**: General disaster area overview
- **Shows**: 
  - Affected regions highlighted
  - Disaster epicenter/center
  - Surrounding geography
  - Scale and extent
- **Format**: Static image in frame
- **Aspect Ratio**: 16:9 video proportions

**2. Flood Map** (for flood events)
- **Description**: Water inundation areas
- **Shows**:
  - Flooded regions (blue/dark areas)
  - Water depth levels (if available)
  - Rivers and water bodies
  - Infrastructure in flood zones
- **Color Coding**:
  - Dark blue: Deep water
  - Light blue: Shallow water
  - White/dry: Unaffected areas

**3. Rain Map**
- **Description**: Precipitation patterns
- **Shows**:
  - Rainfall accumulation
  - Storm tracks
  - Precipitation intensity
- **Color Scale**:
  - Green: Light rain
  - Yellow: Moderate
  - Red: Heavy rainfall

**4. Population Map**
- **Description**: Affected population density
- **Shows**:
  - Population centers
  - Density heatmap
  - Vulnerable communities
  - Evacuation priorities
- **Color Coding**:
  - Red: High population density
  - Yellow: Medium
  - Green: Low

#### Map Display
- **Grid Layout**: 2x2 on desktop, stacked on mobile
- **Image Quality**: High-resolution where available
- **Interaction**: Click to enlarge (if implemented)
- **Loading**: Gray placeholder while loading

---

### Additional Details Tab

**Purpose**: Technical information and supplementary data

#### Section 1: Severity Information

**Severity Card**:
- **Label**: "Severity"
- **Content**: Severity text description
- Human-readable severity explanation
- Context about disaster intensity

**Alert Scores Card**:
- **Label**: "Alert Scores"
- **Content**:
  - Overall alert score: Numeric value
  - Episode alert score: Specific episode rating
- Higher scores = more severe event

#### Section 2: Geographic Coverage

**Affected Countries Card**:
- **Header**: "Affected Countries"
- **Display**: Badge-style list
- Each badge shows:
  - Country name
  - ISO3 code in parentheses
- Multiple countries for cross-border disasters

#### Section 3: External Resources

**External Links Card**:
- **Label**: "External Links"
- **Links Include**:

1. **Official Report**
   - Full GDACS report
   - Opens in new tab
   - PDF or web format
   
2. **Media Coverage**
   - News articles and media
   - External press releases
   - Public information
   
3. **Geometry Data**
   - GeoJSON or KML files
   - Technical geographic data
   - For GIS analysis

**Link Styling**:
- Blue underlined text
- Hover effect
- External link icon (optional)

---

### Report Navigation Tips

**Switching Between Tabs**:
1. Click tab name at top
2. Active tab highlighted
3. Content changes instantly
4. No page reload

**Returning to Reports List**:
- Use browser back button
- Or navigate via sidebar

**Sharing Reports**:
- Copy URL from address bar
- Share with team members
- URL contains all necessary parameters

**Printing Reports**:
1. Use browser print function (Ctrl+P)
2. Select printer or Save as PDF
3. All tabs print sequentially
4. Images included

---

## 8. Features by Disaster Type

### Earthquake-Specific Features

#### Data Sources
- **Primary**: USGS (United States Geological Survey)
- **Update Frequency**: Near real-time (minutes)
- **Global Coverage**: Worldwide seismic monitoring

#### Unique Attributes
- **Magnitude Precision**: Decimal accuracy (e.g., 6.83)
- **Depth Measurement**: Kilometers below surface
- **Aftershock Tracking**: Related events linked
- **Seismic Wave Data**: P-wave and S-wave information

#### Best Practices
- Monitor aftershocks after major events
- Filter by shallow depth for damage assessment
- Use heatmap to identify fault lines
- Check historical data for seismic zones

#### Analysis Tips
- Magnitude 5+ requires attention
- Shallow quakes (<70km) more destructive
- Cluster view shows fault line activity
- Compare with population map for impact assessment

---

### Flood-Specific Features

#### Data Sources
- **Primary**: Multiple satellite and ground sensors
- **Update Frequency**: Variable (hours to days)
- **Coverage**: Major river systems and coastal areas

#### Unique Attributes
- **Severity Levels**: Categorical classification
- **Risk Calculation**: Predictive modeling (premium)
- **Water Level Data**: Gauge measurements
- **Inundation Maps**: Flooded area boundaries

#### Best Practices
- Use risk calculator before flood season
- Monitor severity levels during events
- Compare with terrain view
- Check both current and predictive data

#### Risk Assessment Usage
1. **Pre-Event Planning**:
   - Calculate risk for your region
   - Identify vulnerable areas
   - Plan evacuation routes

2. **During Event**:
   - Monitor real-time severity
   - Track flood extent
   - Assess infrastructure impact

3. **Post-Event**:
   - Review affected areas
   - Analyze response effectiveness
   - Plan future mitigation

---

### Wildfire-Specific Features

#### Data Sources
- **Primary**: Satellite thermal detection (MODIS, VIIRS)
- **Update Frequency**: Multiple times daily
- **Coverage**: Global, particularly vegetated areas

#### Unique Attributes
- **Fire Intensity**: Thermal signature strength
- **Confidence Level**: Detection reliability
- **Fire Size**: Approximate affected area
- **Smoke Plume**: Direction and extent

#### Best Practices
- High confidence detections more reliable
- Filter by intensity for major fires
- Use satellite view to see terrain
- Monitor wind direction (if available)

#### Seasonal Considerations
- **Fire Season**: Higher activity periods
- **Drought Conditions**: Increased risk
- **Weather Patterns**: Wind and humidity affect spread
- **Historical Data**: Compare year-over-year

---

## 9. Advanced Features

### Multi-Criteria Filtering

#### Combining Filters
You can use multiple filter criteria simultaneously:

**Example 1: Specific Region Analysis**
1. Set geographic boundaries (lat/lon)
2. Add time range (last 30 days)
3. Set minimum magnitude/severity
4. Result: Recent significant events in your region

**Example 2: Comparative Study**
1. Filter by specific date range
2. Set severity threshold
3. Export or note data
4. Change date range and repeat
5. Compare results

#### Advanced Geographic Selection

**Using Coordinates**:
- **Latitude**: -90 (South Pole) to +90 (North Pole)
- **Longitude**: -180 (West) to +180 (East)
- **Precision**: Up to 6 decimal places

**Common Regions** (approximate):
- **North America**: Lat 15-70, Lon -170 to -50
- **Europe**: Lat 35-70, Lon -10 to 40
- **Asia**: Lat -10-70, Lon 25-150
- **Pacific Ring of Fire**: Specific fault line coordinates

---

### Map Interaction Techniques

#### Zoom Controls
- **Scroll Wheel**: Zoom in/out smoothly
- **Plus/Minus Buttons**: Step zoom
- **Double Click**: Quick zoom in
- **Shift + Double Click**: Quick zoom out

#### Pan Navigation
- **Click and Drag**: Move map around
- **Arrow Keys**: Keyboard navigation
- **Touch Gestures**: Pinch to zoom on tablets

#### Marker Interaction
- **Hover**: Quick preview (if enabled)
- **Click**: Full information popup
- **Popup Contents**:
  - Event details
  - Timestamp
  - Magnitude/Severity
  - Location name
  - Link to full report (if available)

#### Selection Techniques
**Rectangle Selection**:
1. Click first corner
2. Visual guide shows from first point
3. Click opposite corner
4. Rectangle appears
5. Adjust if needed (re-select)

**Precision Tips**:
- Zoom in before selecting
- Use street view for accuracy
- Note coordinate readout
- Verify selection before submitting

---

### Data Export and Analysis

#### Screenshot Method
1. Configure map as desired
2. Use browser screenshot (Print Screen)
3. Or use snippet tool (Windows + Shift + S)
4. Save for reports

#### Coordinate Extraction
- Note latitude/longitude from popups
- Copy from filter dialog
- Use for external GIS analysis
- Share locations with team

#### Report Downloading
- Use browser print → Save as PDF
- Includes all report tabs
- Images embedded
- Share-friendly format

---

### Performance Optimization

#### Large Dataset Handling
When viewing many disasters:

1. **Use Cluster View**:
   - Faster rendering
   - Less browser memory
   - Progressive detail

2. **Apply Filters**:
   - Reduce data volume
   - Focus on relevant events
   - Faster map updates

3. **Adjust Date Range**:
   - Shorter periods load faster
   - Recent data more relevant
   - Archive older searches separately

#### Browser Performance
- **Clear Cache**: If map sluggish
- **Close Other Tabs**: Free memory
- **Update Browser**: Latest version recommended
- **Hardware Acceleration**: Enable in browser settings

---

## 10. Troubleshooting

### Common Issues and Solutions

#### Login Problems

**Issue**: "Invalid email or password"
- **Solution**: 
  - Verify email spelling
  - Check caps lock
  - Try password reset
  - Contact administrator if persistent

**Issue**: Redirected to login repeatedly
- **Solution**:
  - Clear browser cookies
  - Check localStorage enabled
  - Try different browser
  - Disable ad blockers

**Issue**: "Remember Me" not working
- **Solution**:
  - Enable cookies in browser
  - Check browser privacy settings
  - Don't use incognito/private mode
  - Update browser

---

#### Map Display Issues

**Issue**: Map not loading
- **Solution**:
  - Check internet connection
  - Refresh page (F5)
  - Clear browser cache
  - Try different map view (Streets/Satellite)
  - Disable browser extensions

**Issue**: Markers not appearing
- **Solution**:
  - Wait for data load (check loading indicator)
  - Zoom out to see if markers outside view
  - Check filters (may be excluding data)
  - Reset filters and try again

**Issue**: Map tiles missing (gray squares)
- **Solution**:
  - Wait for tiles to load
  - Check internet speed
  - Try different map view
  - Refresh browser

**Issue**: Slow map performance
- **Solution**:
  - Use cluster view for many points
  - Apply filters to reduce data
  - Close other browser tabs
  - Reduce map zoom level
  - Try heatmap instead of markers

---

#### Filter Problems

**Issue**: "No data found" after filtering
- **Solution**:
  - Widen filter criteria
  - Check date range (not too narrow)
  - Verify geographic bounds correct
  - Remove minimum thresholds
  - Reset all filters and start over

**Issue**: Map selector not working
- **Solution**:
  - Ensure JavaScript enabled
  - Click exactly two points
  - Wait between clicks
  - Refresh dialog if stuck
  - Enter coordinates manually

**Issue**: Filters not applying
- **Solution**:
  - Click "Continue" button
  - Wait for loading indicator
  - Check for error messages
  - Refresh page and retry
  - Verify values in correct format

---

#### Data Loading Issues

**Issue**: Endless loading spinner
- **Solution**:
  - Wait 30-60 seconds
  - Check internet connection
  - Refresh page
  - Try different disaster type
  - Check system status (if available)

**Issue**: Old data showing
- **Solution**:
  - Hard refresh (Ctrl + Shift + R)
  - Clear browser cache
  - Check data timestamp
  - Reapply filters
  - Log out and back in

**Issue**: Missing disaster events
- **Solution**:
  - Check filter settings
  - Verify time range includes events
  - Try "View All" or reset filters
  - Check if data source available
  - Refresh data feed

---

#### Report Problems

**Issue**: "Report not found"
- **Solution**:
  - Click "Generate New Report"
  - Check GDACS ID correct
  - Verify disaster type matches
  - Ensure logged in
  - Try different event

**Issue**: Images not loading in report
- **Solution**:
  - Wait for image load
  - Check internet connection
  - Refresh page
  - Try different browser
  - Report may not have imagery

**Issue**: Cannot generate new report
- **Solution**:
  - Verify login status
  - Check user permissions
  - Wait and retry (server may be busy)
  - Try existing report first
  - Contact support if persistent

---

#### Risk Calculator Issues

**Issue**: "Login required" for flood risk
- **Solution**:
  - Ensure logged in
  - Check localStorage has user_id
  - Re-login if needed
  - Use "Remember Me" when logging in

**Issue**: "Area exceeds maximum"
- **Solution**:
  - Select smaller area
  - Maximum: 5.5 square degrees
  - Zoom in on map
  - Select more precise region
  - Break into multiple calculations

**Issue**: Risk calculation timeout
- **Solution**:
  - Wait longer (can take 60 seconds)
  - Try smaller area
  - Check internet connection
  - Retry during off-peak hours
  - Simplify area shape

---

### Error Messages Explained

**"Failed to load alerts"**
- **Meaning**: Cannot reach data API
- **Action**: Check connection, refresh, retry

**"Login failed. Please check your credentials or try again later"**
- **Meaning**: Authentication error
- **Action**: Verify credentials, wait, check server status

**"No [disaster type] data found for the selected filters"**
- **Meaning**: Filter too restrictive
- **Action**: Widen criteria, check parameters

**"This is a premium feature. Please login to your account to access it"**
- **Meaning**: Authentication required
- **Action**: Log in with valid account

**"Selected area exceeds maximum allowed"**
- **Meaning**: Risk calculation area too large
- **Action**: Select smaller region (max 5.5 sq degrees)

---

### Browser Compatibility

#### Recommended Browsers
1. **Google Chrome** (Latest version)
   - Best performance
   - Full feature support
   - Recommended choice

2. **Mozilla Firefox** (Latest version)
   - Excellent compatibility
   - Good performance

3. **Safari** (Latest version)
   - Mac users
   - Good support

4. **Microsoft Edge** (Latest version)
   - Chromium-based
   - Good compatibility

#### Minimum Requirements
- JavaScript enabled
- Cookies enabled
- LocalStorage enabled
- Canvas support
- WebGL for map rendering

#### Not Supported
- Internet Explorer (any version)
- Very old browser versions
- Browsers with JavaScript disabled

---

### Getting Help

#### Self-Service Options
1. **Review this manual**: Comprehensive guide
2. **Check error messages**: Often contain solutions
3. **Try different browser**: Rule out browser issues
4. **Clear cache and cookies**: Resolve many issues

#### Contact Support
When you need additional help:

**What to Include**:
1. **Your User ID**: Found in reports or settings
2. **Error Message**: Exact text
3. **Browser**: Name and version
4. **Operating System**: Windows, Mac, Linux
5. **Steps to Reproduce**: What you were doing
6. **Screenshot**: If applicable
7. **Time of Error**: When it occurred

**How to Contact**:
- Email support team (contact provided by admin)
- Include all information above
- Expect response within 24-48 hours

---

## 11. Tips and Best Practices

### Efficient Disaster Monitoring

#### Daily Workflow
1. **Morning Check**:
   - Review Home page for top alerts
   - Note any extreme (red) alerts
   - Check your regions of interest

2. **Detailed Analysis**:
   - Navigate to Disaster Map
   - Apply filters for your region
   - Review each disaster type tab

3. **Deep Dive**:
   - Generate reports for significant events
   - Analyze impact data
   - Share relevant reports with team

#### Setting Up Monitoring Zones

**Define Your Regions**:
1. Identify areas you need to monitor
2. Note their lat/lon boundaries
3. Save coordinates in a document
4. Use same coordinates in filters regularly

**Create Monitoring Templates**:
- Document your common filter settings
- Note search parameters for quick replication
- Save coordinate sets for each region
- Streamline daily monitoring

---

### Analysis Best Practices

#### Comparative Analysis
**Comparing Events**:
1. Filter for first event
2. Take screenshot or note data
3. Modify filters for second event
4. Compare results side-by-side

**Temporal Analysis**:
1. Set date range for historical period
2. Note patterns and statistics
3. Change to recent period
4. Identify trends

#### Multi-Disaster Correlation
**Checking Relationships**:
1. Review earthquake data in region
2. Check flood tab for same coordinates
3. Look for landslide triggers
4. Cross-reference timing

**Example Scenarios**:
- Earthquake → Tsunami → Flooding
- Drought → Wildfire increase
- Heavy rain → Flooding → Landslides

---

### Map Visualization Tips

#### Choosing the Right View

**For Overview**: 
- Use Heatmap + Streets
- See patterns quickly
- Identify hotspots

**For Details**:
- Use Markers + Satellite
- Precise locations
- Individual event data

**For Analysis**:
- Use Clusters + Terrain
- Understand geography
- Manage many points

**For Presentations**:
- Use Polygons + Streets
- Clear boundaries
- Professional appearance

#### Effective Filtering

**Start Broad, Then Narrow**:
1. Begin with no filters (see all data)
2. Add geographic bounds
3. Add time range
4. Add magnitude/severity threshold
5. Fine-tune as needed

**Save Time with Common Filters**:
- Keep notes of effective filter combinations
- Use recent date ranges (last 7/30/90 days)
- Standard regions you monitor
- Typical severity thresholds

---

### Report Usage Strategies

#### When to Generate Reports

**Generate New Report When**:
- Event just occurred (last 24 hours)
- Need latest updates
- Previous report outdated
- Sharing with external parties

**Use Existing Report When**:
- Historical event
- Quick reference needed
- Bandwidth limited
- Multiple team members viewing same event

#### Extracting Key Information

**Quick Scan Method**:
1. Read header banner (alert level, name)
2. Check Summary tab (overview)
3. Review Impact Data (people affected)
4. Note maps (visual extent)
5. Check Additional Details (severity scores)

**Comprehensive Analysis**:
1. All of above, plus:
2. Note all affected countries
3. Review external links
4. Compare multiple reports
5. Track over time (updates)

---

### Security and Privacy

#### Protecting Your Account
- Never share your password
- Use "Remember Me" only on personal devices
- Log out on shared computers
- Change password regularly (if option available)

#### Data Privacy
- User_id stored locally only
- Login credentials encrypted in transit
- No personal data shared without consent
- Reports contain public disaster information only

#### Safe Browsing
- Access from secure networks
- Avoid public Wi-Fi for sensitive operations
- Keep browser updated
- Enable HTTPS (usually automatic)

---

### Keyboard Shortcuts

#### Map Navigation
- **Arrow Keys**: Pan map
- **Plus (+)**: Zoom in
- **Minus (-)**: Zoom out
- **Home**: Reset to default view (if implemented)

#### General Navigation
- **Tab**: Move between form fields
- **Enter**: Submit forms/dialogs
- **Escape**: Close dialogs
- **Ctrl + R**: Refresh page
- **Ctrl + Shift + R**: Hard refresh (clear cache)

#### Browser Functions
- **Ctrl + F**: Find text on page
- **Ctrl + P**: Print report
- **Ctrl + S**: Save page
- **F5**: Refresh

---

### Mobile Usage

#### Responsive Design
The application adapts to different screen sizes:

**Desktop (>1024px)**:
- Full sidebar visible
- Multi-column layouts
- Larger map displays

**Tablet (768-1024px)**:
- Collapsible sidebar
- Adapted layouts
- Touch-friendly controls

**Mobile (<768px)**:
- Icon-only sidebar
- Stacked layouts
- Optimized for portrait

#### Touch Gestures
- **Pinch**: Zoom in/out on map
- **Two-finger drag**: Pan map
- **Tap**: Select markers, open popups
- **Double-tap**: Quick zoom in
- **Swipe**: Scroll content

#### Mobile Tips
- Use landscape for map viewing
- Collapse sidebar for more space
- Filter sparingly (smaller screen)
- Use cluster view (easier to tap)

---

### Accessibility Features

#### Screen Reader Support
- Semantic HTML structure
- ARIA labels on controls
- Descriptive alt text for images
- Keyboard-navigable interface

#### Visual Accessibility
- High contrast mode support (if enabled)
- Adjustable text sizes (browser zoom)
- Color-blind friendly maps (consider palette)
- Clear typography

#### Navigation Aids
- Skip to content links
- Logical tab order
- Focus indicators
- Consistent layout

---

### Performance Tips

#### Optimizing Load Times
1. **Filter Early**: Apply filters before viewing map
2. **Close Unused Tabs**: Browser has one active disaster type
3. **Clear Cache**: Periodically (weekly/monthly)
4. **Use Clusters**: For dense data sets
5. **Limit Date Range**: Recent data only

#### Bandwidth Considerations
**Low Bandwidth**:
- Use Streets view (lighter than Satellite)
- Limit data with filters
- Use existing reports (don't regenerate)
- Avoid loading all disaster types simultaneously

**Fast Connection**:
- Use Satellite view
- Load comprehensive data
- Generate new reports
- View multiple tabs/maps

---

### Advanced Scenarios

#### Emergency Response Planning

**Pre-Disaster**:
1. Identify historical patterns in region
2. Use risk calculator (floods)
3. Note vulnerable locations
4. Establish monitoring protocol

**During Disaster**:
1. Monitor real-time updates
2. Filter for active events
3. Generate reports for major events
4. Share reports with response team

**Post-Disaster**:
1. Review impact data
2. Analyze response effectiveness
3. Document lessons learned
4. Update planning based on data

#### Research and Education

**Academic Use**:
- Historical data analysis
- Pattern identification
- Geographic correlations
- Climate trend studies

**Training**:
- Demonstrate disaster monitoring
- Practice filter techniques
- Analyze case studies
- Emergency response scenarios

#### Multi-User Coordination

**Team Workflows**:
1. **Designated Monitors**: Assign regions to team members
2. **Shared Reports**: Generate and share URLs
3. **Regular Updates**: Daily briefings using Home page
4. **Escalation Protocol**: Define alert level triggers

**Information Sharing**:
- Screenshot maps for presentations
- Export report PDFs
- Share filtered view URLs
- Coordinate response using data

---

### Staying Updated

#### Data Freshness
- Earthquake data: Updates within minutes
- Flood data: Updates hourly to daily
- Wildfire data: Updates multiple times daily
- GDACS reports: Updated as situations evolve

#### System Updates
- Application updates deployed automatically
- No action required from users
- New features announced (watch for notifications)
- This manual updated with new features

#### Learning Resources
- Review this manual periodically
- Check for updated sections
- Practice with different disaster types
- Explore all features systematically

---

## Appendix A: Glossary

**Alert Level**: Color-coded severity indicator (Green, Yellow, Orange, Red) based on disaster magnitude and impact.

**Cluster View**: Map visualization that groups nearby disasters into numbered clusters to manage large datasets.

**Depth**: For earthquakes, the distance below Earth's surface where the earthquake originated (measured in kilometers).

**Filter State**: Current configuration of filter parameters that determines which disasters are displayed.

**GDACS**: Global Disaster Alert and Coordination System - international platform providing real-time alerts for major disasters.

**GeoJSON**: Geographic data format used to represent disaster locations and boundaries.

**Heatmap**: Color-gradient visualization showing concentration and intensity of disasters in different areas.

**ISO3**: Three-letter country code (e.g., USA, GBR, JPN) used in international disaster reporting.

**Magnitude**: Measurement of earthquake strength on the Richter scale (typically 0-10, though open-ended).

**Polygon View**: Map visualization showing disasters as geometric shapes representing affected areas.

**Risk Score**: Numerical assessment (0-100) of flood likelihood in a selected area.

**Sendai Framework**: International standard for disaster data reporting and humanitarian impact assessment.

**Severity Level**: Classification of disaster intensity (Low, Moderate, High, Severe, Extreme).

**USGS**: United States Geological Survey - primary source for global earthquake data.

**User_id**: Unique identifier for your account, stored locally for session management.

---

## Appendix B: Disaster Magnitude Scales

### Earthquake Magnitude Scale (Richter/Moment Magnitude)
- **< 2.0**: Micro - Not felt, detected only by instruments
- **2.0 - 2.9**: Minor - Rarely felt
- **3.0 - 3.9**: Minor - Often felt, rarely causes damage
- **4.0 - 4.9**: Light - Noticeable indoor shaking, minimal damage
- **5.0 - 5.9**: Moderate - Damage to poorly constructed buildings
- **6.0 - 6.9**: Strong - Destructive in populated areas up to 160 km
- **7.0 - 7.9**: Major - Serious damage over large areas
- **8.0 - 8.9**: Great - Destruction over several hundred kilometers
- **9.0+**: Extreme - Devastating in regions thousands of kilometers across

### Flood Severity Levels
- **Low**: Minor flooding, minimal impact, localized
- **Moderate**: Notable flooding, some evacuations, property damage
- **High**: Significant flooding, widespread evacuations, major damage
- **Severe**: Extensive flooding, life-threatening, infrastructure compromise
- **Extreme**: Catastrophic flooding, massive evacuations, region-wide emergency

### Wildfire Intensity Categories
- **Low**: Small fires, easily contained, minimal spread
- **Moderate**: Growing fires, active suppression needed
- **High**: Large fires, difficult to contain, rapid spread
- **Severe**: Very large fires, major resources needed, evacuation likely
- **Extreme**: Mega-fires, out of control, catastrophic damage

---

## Appendix C: Coordinate Reference Guide

### Understanding Coordinates

**Latitude (Lat)**:
- Measures North-South position
- Range: -90° (South Pole) to +90° (North Pole)
- 0° is the Equator
- Positive = North, Negative = South

**Longitude (Lon)**:
- Measures East-West position
- Range: -180° to +180°
- 0° is Prime Meridian (Greenwich, UK)
- Positive = East, Negative = West

### Major Regions (Approximate Coordinates)

**North America**:
- Lat: 15° to 70° N (15 to 70)
- Lon: 170° W to 50° W (-170 to -50)

**South America**:
- Lat: 55° S to 15° N (-55 to 15)
- Lon: 80° W to 35° W (-80 to -35)

**Europe**:
- Lat: 35° N to 70° N (35 to 70)
- Lon: 10° W to 40° E (-10 to 40)

**Africa**:
- Lat: 35° S to 35° N (-35 to 35)
- Lon: 20° W to 50° E (-20 to 50)

**Asia**:
- Lat: 10° S to 70° N (-10 to 70)
- Lon: 25° E to 150° E (25 to 150)

**Australia/Oceania**:
- Lat: 50° S to 0° (-50 to 0)
- Lon: 110° E to 180° E (110 to 180)

### Seismically Active Regions

**Pacific Ring of Fire**:
- Encompasses Pacific Ocean rim
- Japan: ~36° N, 138° E
- California: ~37° N, -122° W
- Chile: ~-35° S, -71° W
- Indonesia: ~-2° S, 118° E

**Mediterranean-Himalayan Belt**:
- Turkey: ~39° N, 35° E
- Iran: ~32° N, 53° E
- Nepal: ~28° N, 84° E
- Greece: ~39° N, 22° E

---

## Appendix D: API Error Codes

Common error codes you might encounter (if displayed):

- **400**: Bad Request - Check filter parameters
- **401**: Unauthorized - Login required or session expired
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **429**: Too Many Requests - Wait and retry
- **500**: Internal Server Error - Server issue, retry later
- **503**: Service Unavailable - Maintenance or overload

---

## Appendix E: Quick Reference Card

### Login
- URL: `/auth/login`
- Required: Email, Password
- Optional: Remember Me checkbox

### Dashboard Sections
1. **Home** (`/dashboard`) - Top 5 GDACS alerts
2. **Disasters** (`/dashboard/disasters`) - Interactive maps
3. **Reports** (`/dashboard/reports?gdacs_id=X&type=Y`) - Detailed analysis

### Map Types
- **Heatmap**: Density visualization
- **Markers**: Individual points
- **Clusters**: Grouped points
- **Polygons**: Area shapes

### Map Views
- **Streets**: Road map
- **Satellite**: Aerial imagery
- **Terrain**: Topographic

### Disaster Types
- **Earthquake**: Magnitude, depth, location
- **Flood**: Severity, risk calculation
- **Wildfire**: Intensity, affected area

### Filter Workflow
1. Click "Filter [Type]" button
2. Set parameters (magnitude, date, location)
3. Use Map Selector for coordinates
4. Click "Continue"
5. View filtered results

### Risk Calculator (Floods)
1. Login required
2. Select area on map (max 5.5 sq degrees)
3. Submit calculation
4. View risk score (0-100)

### Report Generation
1. Navigate with `gdacs_id` and `type`
2. Try "Get Existing Report"
3. If not found, "Generate New Report"
4. View in tabbed interface

---

## Conclusion

This manual provides comprehensive guidance for using the REIS (Real-time Emergency Information System) application. The system is designed to provide critical disaster information to help with monitoring, analysis, and response planning.

### Key Takeaways
1. **Authentication**: Always log in to access full features
2. **Filtering**: Use filters to focus on relevant disasters
3. **Visualization**: Choose appropriate map type for your needs
4. **Reports**: Generate detailed reports for major events
5. **Risk Assessment**: Use flood risk calculator for planning

### Continuous Learning
- Explore all three disaster types
- Practice with different filter combinations
- Try all map types and views
- Generate reports for various events
- Experiment with the risk calculator

### Support
For additional assistance:
- Review relevant sections of this manual
- Check troubleshooting section
- Contact your system administrator
- Reach out to technical support with detailed error information

### Version Information
- **Manual Version**: 1.0
- **Last Updated**: December 3, 2025
- **Application**: REIS Frontend
- **Framework**: Next.js

---

**Stay safe and informed with REIS!**

*This manual is a living document and will be updated as new features are added to the application.*
remve from markdown and write in simple text