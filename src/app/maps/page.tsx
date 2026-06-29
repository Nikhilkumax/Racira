import {
  MapPin, Globe, Mountain, Satellite, Map, Layers, Compass, Navigation,
  Ruler, Square, Hexagon, Calculator, Search, Pin, Crosshair,
  FileCode, FileText, Download, Upload, Repeat,
  Activity, BarChart3, Filter, Target, Zap, Grid3x3, Waypoints,
  Locate, Boxes, GitBranch, Wind, Droplets, Cloud,
  Building2, TreePine, Camera, Share2, Code2, Box, Workflow,
  Edit3, Palette, Tag, Type, Eye, CheckCircle2, Merge, Link2, Clock,
  Flame, Triangle, Layers3, Grid2x2, Telescope, History,
  Wifi, Radio, FileImage, FileType, Hash, Globe2,
  Moon, Car, Bike, Ship, Image as ImageIcon, Move, PenTool,
  Sparkles, Minimize2, GitCompare, Database, Shuffle, ArrowDownUp, Dna,
  Gauge, Plane, Magnet, Sunrise, MapPinned, Trees, Waves, Lightbulb,
  Film, HardDrive, CloudDownload, ScanLine, Wand2, Network,
  AlertTriangle, Thermometer,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Racira Maps & GIS — 165+ Free Online Map & Geospatial Tools",
  description: "165+ free Maps & GIS tools. Convert coordinates, measure distances, view geodata, build maps, run spatial analysis — all in your browser.",
  openGraph: {
    title: "Racira Maps & GIS",
    description: "Free online Maps & GIS toolkit — 165+ tools for coordinates, geocoding, routing, geodata viewers and more.",
  },
};

type Tool = { name: string; desc: string; icon: React.ComponentType<{ className?: string }> };
type Section = { title: string; tools: Tool[] };

const sections: Section[] = [
  {
    title: "Map Viewing & Exploration",
    tools: [
      { name: "Interactive Map Viewer", desc: "Leaflet / OpenLayers powered viewer", icon: Map },
      { name: "OpenStreetMap Browser", desc: "Browse the OSM basemap", icon: Globe },
      { name: "Satellite Imagery Viewer", desc: "Tile-based satellite browser", icon: Satellite },
      { name: "Terrain / Elevation Map", desc: "Visualize elevation and relief", icon: Mountain },
      { name: "Street-Level Map Browser", desc: "OSM-based street map viewer", icon: Navigation },
      { name: "Historical Map Viewer", desc: "Explore archival map layers", icon: History },
      { name: "Topographic Map Viewer", desc: "Topo maps with contour detail", icon: Mountain },
      { name: "Contour Line Map Explorer", desc: "Inspect elevation contours", icon: Activity },
      { name: "Geological Map Reference", desc: "Reference geological layers", icon: Layers },
      { name: "Night Sky Map Viewer", desc: "Browser-based star map", icon: Telescope },
      { name: "Hybrid Satellite/Street View", desc: "Satellite imagery with street labels", icon: Layers3 },
      { name: "Dark Mode Map", desc: "Low-light styled basemap", icon: Moon },
      { name: "3D Globe / Earth Viewer", desc: "Spin a 3D model of the world", icon: Globe2 },
      { name: "Weather Map Overlay", desc: "Overlay weather data on the map", icon: Cloud },
      { name: "Traffic Map Viewer", desc: "Reference traffic flow layers", icon: Car },
      { name: "Hiking / Bike Trail Map", desc: "Trail-focused map browser", icon: Bike },
      { name: "Marine Chart Viewer", desc: "Nautical chart reference browser", icon: Ship },
    ],
  },
  {
    title: "Map Creation & Editing",
    tools: [
      { name: "Custom Map Maker", desc: "Build maps with Leaflet", icon: Edit3 },
      { name: "Annotated Map Builder", desc: "Add notes and markers to maps", icon: Pin },
      { name: "Map Layer Composer", desc: "Stack and order layers", icon: Layers3 },
      { name: "Custom Tile Layer Builder", desc: "Define your own tile sources", icon: Grid3x3 },
      { name: "Map Style Editor", desc: "Edit MapboxGL styles", icon: Palette },
      { name: "Map Color Theme Builder", desc: "Design custom map palettes", icon: Palette },
      { name: "Map Label Editor", desc: "Edit map label rendering", icon: Type },
      { name: "Map Legend Builder", desc: "Compose a map legend", icon: Tag },
      { name: "Choropleth Map Builder", desc: "Thematic maps from local data", icon: BarChart3 },
      { name: "Heat Map Creator", desc: "Generate heatmaps from data", icon: Flame },
      { name: "Map Title Editor", desc: "Style and position map titles", icon: Type },
      { name: "Map Watermark Tool", desc: "Apply watermarks to map exports", icon: ImageIcon },
      { name: "Marker Icon Designer", desc: "Design custom marker icons", icon: Pin },
      { name: "Polyline Drawing Tool", desc: "Draw and export polylines", icon: PenTool },
      { name: "Polygon Drawing Tool", desc: "Draw and export polygons", icon: Hexagon },
      { name: "Map Inset Builder", desc: "Build inset / locator maps", icon: Move },
    ],
  },
  {
    title: "GeoJSON & Spatial Data",
    tools: [
      { name: "GeoJSON Editor", desc: "Edit GeoJSON features visually", icon: Edit3 },
      { name: "GeoJSON Viewer", desc: "Drop a file to preview", icon: FileCode },
      { name: "GeoJSON Validator", desc: "Check GeoJSON for errors", icon: CheckCircle2 },
      { name: "GeoJSON to KML Converter", desc: "Convert GeoJSON into KML", icon: Repeat },
      { name: "KML to GeoJSON Converter", desc: "Convert KML into GeoJSON", icon: Repeat },
      { name: "GeoJSON to CSV (Points)", desc: "Flatten point features to CSV", icon: Download },
      { name: "CSV Lat/Lng to GeoJSON", desc: "Convert CSV coords to GeoJSON", icon: Upload },
      { name: "GeoJSON Simplifier", desc: "Reduce vertices in geometry", icon: Filter },
      { name: "GeoJSON Merger", desc: "Combine multiple GeoJSON files", icon: Merge },
      { name: "GeoJSON Feature Inspector", desc: "Inspect properties and geometry", icon: Eye },
      { name: "GeoJSON Pretty Printer", desc: "Format GeoJSON for readability", icon: Sparkles },
      { name: "GeoJSON Minifier", desc: "Strip whitespace from GeoJSON", icon: Minimize2 },
      { name: "GeoJSON Diff Tool", desc: "Compare two GeoJSON files", icon: GitCompare },
      { name: "GeoJSON Stats Analyzer", desc: "Compute counts, extents, summaries", icon: BarChart3 },
      { name: "GeoJSON to TopoJSON", desc: "Convert into TopoJSON format", icon: Repeat },
      { name: "TopoJSON to GeoJSON", desc: "Convert TopoJSON back to GeoJSON", icon: Repeat },
      { name: "GeoJSON Random Generator", desc: "Generate random GeoJSON features", icon: Shuffle },
    ],
  },
  {
    title: "Coordinate Tools",
    tools: [
      { name: "Coordinate Format Converter", desc: "DD / DMS / DDM conversions", icon: Repeat },
      { name: "Lat/Lng to Address", desc: "Manual geocoding worksheet", icon: MapPin },
      { name: "Address to Lat/Lng", desc: "Reference geocoding tool", icon: Search },
      { name: "MGRS Converter", desc: "Military Grid Reference System", icon: Target },
      { name: "UTM Converter", desc: "Convert lat/lng to UTM", icon: Grid3x3 },
      { name: "ECEF Converter", desc: "Earth-Centered Earth-Fixed coords", icon: Globe2 },
      { name: "Bearing Calculator", desc: "Bearing between two points", icon: Compass },
      { name: "Midpoint Calculator", desc: "Midpoint of two coordinates", icon: GitBranch },
      { name: "Bounding Box Calculator", desc: "Compute a bounding box", icon: Square },
      { name: "Map Center Finder", desc: "Find the center of features", icon: Crosshair },
      { name: "Plus Code Generator", desc: "Create Open Location Codes", icon: Code2 },
      { name: "Geohash Encoder", desc: "Encode coordinates to geohash", icon: Hash },
      { name: "Geohash Decoder", desc: "Decode geohash back to lat/lng", icon: Hash },
      { name: "Lat/Lng Validator", desc: "Validate coordinate ranges", icon: CheckCircle2 },
      { name: "Coordinate Precision Trimmer", desc: "Trim coordinates to N decimals", icon: ArrowDownUp },
      { name: "Antipode Finder", desc: "Find the opposite side of Earth", icon: Globe },
    ],
  },
  {
    title: "Distance & Area",
    tools: [
      { name: "Distance Between Two Points", desc: "Great-circle distance calculator", icon: Ruler },
      { name: "Route Distance Estimator", desc: "Distance across manual waypoints", icon: Waypoints },
      { name: "Polygon Area Calculator", desc: "Area from coordinate polygon", icon: Square },
      { name: "Buffer Zone Calculator", desc: "Build buffer zones around features", icon: Target },
      { name: "Travel Radius Visualizer", desc: "Visualize radius around a point", icon: Target },
      { name: "Service Area Estimator", desc: "Estimate a service coverage area", icon: Hexagon },
      { name: "Walking/Driving Distance", desc: "Reference travel distance tool", icon: Activity },
      { name: "Fuel Consumption by Distance", desc: "Estimate fuel use over distance", icon: Droplets },
      { name: "Scale Bar Calculator", desc: "Compute scale bar values", icon: Ruler },
      { name: "Map Distance Ruler", desc: "Click to measure on the map", icon: Ruler },
      { name: "Polyline Length Calculator", desc: "Total length of a polyline", icon: PenTool },
      { name: "Multi-Point Distance Sum", desc: "Sum distance across many points", icon: Waypoints },
      { name: "Haversine Distance Tool", desc: "Spherical earth distance formula", icon: Globe },
      { name: "Vincenty Distance Tool", desc: "Ellipsoidal geodesic distance", icon: Globe2 },
      { name: "Ellipse Area Calculator", desc: "Area of geographic ellipse", icon: Hexagon },
      { name: "Circle Area on Sphere", desc: "Spherical cap area calculator", icon: Hexagon },
      { name: "Distance Unit Converter", desc: "km, mi, nm, ft conversions", icon: Repeat },
    ],
  },
  {
    title: "Spatial Analysis (Client-Side)",
    tools: [
      { name: "Point-in-Polygon Checker", desc: "Test points against polygons", icon: Square },
      { name: "Intersection Detector", desc: "Detect overlap between polygons", icon: GitBranch },
      { name: "Spatial Clustering Visualizer", desc: "Cluster points by proximity", icon: Boxes },
      { name: "Nearest Neighbor Finder", desc: "Find closest features in local data", icon: Locate },
      { name: "Voronoi Diagram Generator", desc: "Build Voronoi cells from points", icon: Hexagon },
      { name: "Delaunay Triangulation", desc: "Triangulate a point set", icon: Triangle },
      { name: "Convex Hull Generator", desc: "Wrap points in a convex hull", icon: Hexagon },
      { name: "Concave Hull Generator", desc: "Tight concave hull of points", icon: Hexagon },
      { name: "Spatial Join Preview", desc: "Join attributes by location", icon: Workflow },
      { name: "Density Map Generator", desc: "Density surface from points", icon: Flame },
      { name: "Buffer Generator", desc: "Generate buffers around features", icon: Target },
      { name: "Polygon Centroid Finder", desc: "Compute polygon centroids", icon: Crosshair },
      { name: "Polygon Simplifier", desc: "Reduce polygon complexity", icon: Filter },
      { name: "Line Smoothing Tool", desc: "Smooth jagged polylines", icon: Wand2 },
      { name: "Random Point Generator", desc: "Generate points within bounds", icon: Shuffle },
      { name: "Grid Point Generator", desc: "Generate regular grid of points", icon: Grid3x3 },
    ],
  },
  {
    title: "Map Layers & Overlays",
    tools: [
      { name: "Marker Cluster Layer", desc: "Cluster markers automatically", icon: Boxes },
      { name: "Heatmap Overlay Builder", desc: "Compose a heatmap overlay", icon: Zap },
      { name: "GeoJSON Overlay Tool", desc: "Overlay GeoJSON on basemaps", icon: Layers },
      { name: "WMS Layer Connector", desc: "Connect to WMS services", icon: Wifi },
      { name: "Raster Tile Preview", desc: "Preview raster XYZ tiles", icon: Grid2x2 },
      { name: "Vector Tile Inspector", desc: "Inspect vector tile contents", icon: Code2 },
      { name: "Map Grid Overlay", desc: "Draw lat/lng grids on maps", icon: Grid3x3 },
      { name: "Military Grid Overlay", desc: "MGRS grid overlay tool", icon: Target },
      { name: "Geographic Boundary Overlay", desc: "Country / region boundaries", icon: Globe2 },
      { name: "Census Boundary Reference", desc: "Reference census boundaries", icon: Building2 },
      { name: "Tile XYZ URL Tester", desc: "Test XYZ tile URL templates", icon: Network },
      { name: "TMS Layer Loader", desc: "Load TMS-format tile layers", icon: Layers },
      { name: "GPX Track Overlay", desc: "Overlay GPX tracks on a map", icon: Activity },
      { name: "KML Overlay Loader", desc: "Load KML files as overlays", icon: FileCode },
      { name: "Country Boundary Overlay", desc: "World country outlines layer", icon: Globe },
      { name: "Postal Code Boundary Ref", desc: "Reference postal code areas", icon: Pin },
      { name: "Time Zone Overlay", desc: "Display timezone polygons", icon: Clock },
    ],
  },
  {
    title: "Location & Navigation",
    tools: [
      { name: "Browser Geolocation", desc: "Get the device's location", icon: Locate },
      { name: "GPS Coordinate Logger", desc: "Log GPS samples in the browser", icon: Radio },
      { name: "Current Location Display", desc: "Show your live coordinates", icon: Crosshair },
      { name: "Location Sharing Card", desc: "Build a shareable location card", icon: Share2 },
      { name: "Nearest City Finder", desc: "Closest city from local data", icon: Building2 },
      { name: "Time Zone from Coordinates", desc: "Detect timezone for any point", icon: Clock },
      { name: "Country from Coordinates", desc: "Identify the country at a point", icon: Globe },
      { name: "Elevation from Coordinates", desc: "Reference elevation lookup", icon: Mountain },
      { name: "What3Words Format Reference", desc: "Three-word address reference", icon: Hash },
      { name: "Plus Code (OLC) Decoder", desc: "Decode Open Location Codes", icon: Code2 },
      { name: "IP-Based Location Lookup", desc: "Approximate location from IP", icon: Wifi },
      { name: "Compass / Heading Display", desc: "Live device heading readout", icon: Compass },
      { name: "Speed / Velocity Display", desc: "Live speed from GPS samples", icon: Gauge },
      { name: "Altitude Reader", desc: "Read device altitude", icon: Plane },
      { name: "Magnetic Declination Reference", desc: "Look up declination by point", icon: Magnet },
      { name: "Sunrise / Sunset by Coordinates", desc: "Solar event times anywhere", icon: Sunrise },
    ],
  },
  {
    title: "Urban & Environmental GIS",
    tools: [
      { name: "Flood Zone Reference Map", desc: "Reference flood risk areas", icon: Droplets },
      { name: "Earthquake Fault Line Map", desc: "Reference fault line layers", icon: Activity },
      { name: "Land Use Classification", desc: "Classify land use on a map", icon: Layers },
      { name: "Urban Density Visualizer", desc: "Density visualization from data", icon: BarChart3 },
      { name: "Environmental Impact Map", desc: "Assessment overlay tool", icon: TreePine },
      { name: "Protected Area Boundary", desc: "View protected area outlines", icon: TreePine },
      { name: "Watershed Delineation Ref", desc: "Reference watershed boundaries", icon: Droplets },
      { name: "Air Quality Zone Reference", desc: "Reference AQI zones", icon: Wind },
      { name: "Noise Pollution Map Ref", desc: "Reference noise level maps", icon: Activity },
      { name: "Wildfire Risk Zone Ref", desc: "Reference wildfire risk zones", icon: Flame },
      { name: "Population Density Reference", desc: "Reference population density", icon: MapPinned },
      { name: "Climate Zone Reference", desc: "Köppen climate zones reference", icon: Thermometer },
      { name: "Soil Type Reference Map", desc: "Reference soil classification", icon: Dna },
      { name: "Vegetation Index Reference", desc: "NDVI / greenness reference", icon: Trees },
      { name: "Coastal Erosion Reference", desc: "Coastal change reference layer", icon: Waves },
      { name: "Light Pollution Reference", desc: "Night sky brightness reference", icon: Lightbulb },
      { name: "Hurricane Track Reference", desc: "Historical storm track viewer", icon: AlertTriangle },
    ],
  },
  {
    title: "Map Utilities",
    tools: [
      { name: "Map Screenshot / Export", desc: "Export the map as an image", icon: Camera },
      { name: "Map to PDF Exporter", desc: "Export the map view to PDF", icon: FileType },
      { name: "Map Thumbnail Generator", desc: "Make small map previews", icon: FileImage },
      { name: "Tile Grid Inspector", desc: "Inspect tile grid indexing", icon: Grid2x2 },
      { name: "Map Scale Calculator", desc: "Calculate map scale by zoom", icon: Calculator },
      { name: "Projection Converter Ref", desc: "WGS84 / Web Mercator reference", icon: Box },
      { name: "Map Legend Generator", desc: "Auto-generate map legends", icon: Tag },
      { name: "Map Attribution Generator", desc: "Build attribution strings", icon: FileText },
      { name: "Permalink URL Builder", desc: "Persist map state in a URL", icon: Link2 },
      { name: "Map Embed Code Generator", desc: "Generate iframe embed code", icon: Code2 },
      { name: "Map GIF Animator", desc: "Animate map snapshots into GIFs", icon: Film },
      { name: "Map Distance Label Generator", desc: "Auto-label distances on the map", icon: Ruler },
      { name: "Coordinate Search Bar Builder", desc: "Build a coordinate search input", icon: Search },
      { name: "Map Cache Inspector", desc: "Inspect tile cache state", icon: HardDrive },
      { name: "Map Tile Downloader Reference", desc: "Reference tile-fetching tool", icon: CloudDownload },
      { name: "Map Snapshot URL Builder", desc: "Build snapshot image URLs", icon: ScanLine },
    ],
  },
];

const totalTools = sections.reduce((n, s) => n + s.tools.length, 0);

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="text-lg">
              <span className="text-primary">Racira</span> Maps & GIS
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#tools" className="hover:text-foreground">Tools</a>
            <a href="#about" className="hover:text-foreground">About</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {totalTools}+ Maps & GIS tools — all free
        </div>
        <h1 className="text-balance text-5xl font-bold tracking-tight md:text-6xl">
          All Maps & GIS Tools You Need —{" "}
          <span className="text-primary">Fast, Simple & Free</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
          Convert coordinates, measure distances, view geodata, build maps and run spatial analysis.
          Every tool runs right in your browser. No signup required.
        </p>
      </section>

      <main id="tools" className="mx-auto max-w-7xl px-6 pb-24">
        {sections.map((section) => (
          <section key={section.title} className="mb-14">
            <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {section.title}{" "}
              <span className="ml-1 text-muted-foreground/60">({section.tools.length})</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {section.tools.map((tool) => (
                <ToolCard key={tool.name} tool={tool} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer id="about" className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-muted-foreground">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="font-semibold text-foreground">Racira Maps & GIS</div>
              <p className="mt-1">Free browser-based Maps & GIS toolkit. No signup, no tracking.</p>
            </div>
            <div className="text-xs">© {new Date().getFullYear()} Racira. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          Coming soon
        </span>
      </div>
      <h3 className="text-base font-semibold text-foreground">{tool.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{tool.desc}</p>
    </div>
  );
}
