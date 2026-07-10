import { ToolResult } from "@/components/CategorySearch";

export type ToolStatus = "live" | "soon";

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string; // lucide icon name
  status: ToolStatus;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

type RawTool = [name: string, description: string, icon: string];

const CATEGORIES: Record<string, RawTool[]> = {
  "Video Conversion": [
    ["MP4 Converter", "Convert any video to MP4 in your browser", "FileVideo"],
    ["WebM Converter", "Convert videos to WebM format", "FileVideo"],
    ["MOV Converter", "Convert videos to MOV format", "FileVideo"],
    ["AVI Converter", "Convert videos to AVI format", "FileVideo"],
    ["MKV Converter", "Convert videos to MKV format", "FileVideo"],
    ["FLV Converter", "Convert videos to FLV format", "FileVideo"],
    ["WMV Converter", "Convert videos to WMV format", "FileVideo"],
    ["M4V Converter", "Convert videos to M4V format", "FileVideo"],
    ["MPEG Converter", "Convert videos to MPEG format", "FileVideo"],
    ["Video Format Converter", "Universal video format converter", "Shuffle"],
    ["H.264 to H.265 Converter", "Re-encode H.264 to HEVC", "Code2"],
    ["VP8 to VP9 Converter", "Re-encode VP8 to VP9", "Code2"],
    ["MTS to MP4", "Convert MTS files to MP4", "ArrowRight"],
    ["TS to MP4", "Convert TS files to MP4", "ArrowRight"],
    ["F4V to MP4", "Convert F4V files to MP4", "ArrowRight"],
    ["3GP to MP4", "Convert 3GP files to MP4", "ArrowRight"],
    ["OGV to MP4", "Convert OGV files to MP4", "ArrowRight"],
    ["Video to WebM", "Convert any video to WebM", "ArrowRight"],
  ],
  "Video Trimming & Editing": [
    ["Video Trimmer", "Trim start and end of a video", "Scissors"],
    ["Video Cutter", "Cut out sections of a video", "Scissors"],
    ["Video Splitter", "Split a video into parts", "SplitSquareVertical"],
    ["Video Merger", "Merge multiple videos together", "Combine"],
    ["Video Joiner", "Join videos end-to-end", "Combine"],
    ["Video Cropper", "Crop video frames", "Crop"],
    ["Video Rotator", "Rotate video orientation", "RotateCw"],
    ["Video Flipper", "Flip videos horizontally or vertically", "FlipHorizontal"],
    ["Video Reverser", "Play video in reverse", "Rewind"],
    ["Video Loop Creator", "Loop videos any number of times", "Repeat"],
    ["Video Speed Changer", "Speed up or slow down a video", "Gauge"],
    ["Video Frame Extractor", "Extract individual frames", "Frame"],
  ],
  "Video Compression & Optimization": [
    ["Video Compressor", "Reduce video file size", "Minimize2"],
    ["Video Size Reducer", "Shrink large video files", "Minimize2"],
    ["Video Bitrate Optimizer", "Optimize bitrate for size and quality", "Activity"],
    ["Resolution Reducer", "Downscale video resolution", "Minimize"],
    ["Video Quality Optimizer", "Balance quality and file size", "SlidersHorizontal"],
    ["Video File Size Calculator", "Estimate video file size", "Calculator"],
    ["Video Bitrate Ladder Calculator", "Plan bitrate ladders for streaming", "BarChart3"],
    ["ABR Ladder Generator", "Generate adaptive bitrate ladders", "BarChart3"],
  ],
  "Video Resolution Tools": [
    ["Video Resizer", "Resize video to any dimensions", "Maximize"],
    ["720p Converter", "Convert videos to 720p", "Monitor"],
    ["1080p Converter", "Convert videos to 1080p", "Monitor"],
    ["1440p Converter", "Convert videos to 1440p", "Monitor"],
    ["4K Converter", "Convert videos to 4K", "Monitor"],
    ["Aspect Ratio Converter", "Change video aspect ratio", "Ratio"],
    ["Portrait to Landscape Converter", "Switch portrait videos to landscape", "RectangleHorizontal"],
    ["Landscape to Portrait Converter", "Switch landscape videos to portrait", "RectangleVertical"],
  ],
  "Video to Image": [
    ["Video to JPG", "Export video frames as JPG images", "Image"],
    ["Video to PNG", "Export video frames as PNG images", "Image"],
    ["Frame Extractor", "Extract frames at any timestamp", "Frame"],
    ["Thumbnail Generator", "Generate thumbnails from videos", "ImagePlus"],
    ["Contact Sheet Creator", "Create a contact sheet of frames", "Grid3x3"],
    ["Video Thumbnail Grid", "Build a grid of video thumbnails", "Grid3x3"],
    ["Video Thumbnail Extractor", "Pull thumbnails at exact times", "ImageDown"],
    ["Video Proof Sheet", "Create a video proof sheet", "Grid3x3"],
  ],
  "Image to Video": [
    ["Image to Video Converter", "Turn images into a video", "Film"],
    ["Slideshow Maker", "Create a slideshow video", "Presentation"],
    ["Photo Montage Creator", "Combine photos into a montage", "Images"],
    ["Timelapse Creator", "Create a timelapse from photos", "Clock"],
  ],
  "Audio & Video": [
    ["Remove Audio from Video", "Strip audio from any video", "VolumeX"],
    ["Replace Video Audio", "Replace a video's audio track", "Music"],
    ["Add Background Music", "Add background music to a video", "Music2"],
    ["Mute Video", "Mute audio in a video", "VolumeX"],
  ],
  "Subtitle Tools": [
    ["Subtitle Generator Template", "Templates to start subtitling", "Captions"],
    ["SRT Editor", "Edit SRT subtitle files", "FileText"],
    ["VTT Editor", "Edit VTT subtitle files", "FileText"],
    ["Subtitle Merger", "Merge two subtitle tracks", "Combine"],
    ["Subtitle Embedder", "Embed subtitles into a video", "Captions"],
    ["Subtitle Extractor", "Extract subtitles from a video", "Captions"],
    ["Subtitle Timing Adjuster", "Adjust subtitle timings", "Clock"],
    ["SRT to VTT Converter", "Convert SRT to VTT", "ArrowRight"],
    ["VTT to SRT Converter", "Convert VTT to SRT", "ArrowRight"],
    ["SRT to ASS Converter", "Convert SRT to ASS", "ArrowRight"],
    ["ASS to SRT Converter", "Convert ASS to SRT", "ArrowRight"],
    ["SRT Timestamp Adjuster", "Shift SRT timestamps", "Clock"],
    ["Subtitle Delay Fixer", "Fix subtitle delay issues", "Clock"],
    ["Subtitle Frame Rate Converter", "Convert subtitle frame rate", "Activity"],
    ["Dual Subtitle Merger", "Merge dual-language subtitles", "Combine"],
    ["Subtitle Font Styler", "Style subtitle fonts", "Type"],
    ["Subtitle Timing Extractor", "Extract cue timings", "Clock"],
    ["Subtitle Preview Tool", "Preview subtitles over a video", "Eye"],
  ],
  "Video Effects": [
    ["Brightness Adjuster", "Adjust video brightness", "Sun"],
    ["Contrast Adjuster", "Adjust video contrast", "Contrast"],
    ["Saturation Adjuster", "Adjust video saturation", "Droplet"],
    ["Grayscale Converter", "Convert video to grayscale", "Palette"],
    ["Blur Effect", "Apply blur to a video", "CircleDashed"],
    ["Sharpen Effect", "Sharpen video frames", "Focus"],
    ["Sepia Effect", "Apply a sepia tone", "Palette"],
    ["Color Filter Tool", "Apply color filters", "Palette"],
    ["Video Watermark Tool", "Add a watermark to videos", "Stamp"],
    ["Text Overlay Tool", "Overlay text on video", "Type"],
    ["Video Color Grading", "Grade video colors", "Palette"],
    ["Video LUT Applier", "Apply LUTs to a video", "Palette"],
    ["Video Denoise", "Reduce noise in a video", "Wand2"],
    ["Video Stabilizer", "Stabilize shaky footage", "Move"],
  ],
  "GIF Tools": [
    ["GIF to Video", "Convert GIF to a video file", "ArrowRight"],
    ["GIF Resizer", "Resize animated GIFs", "Maximize"],
    ["GIF Loop Creator", "Create looping GIFs", "Repeat"],
    ["GIF to MP4", "Convert GIF to MP4", "ArrowRight"],
    ["Animated Thumbnail Creator", "Create animated thumbnails", "ImagePlus"],
  ],
  "Social Media Video": [
    ["YouTube Thumbnail Frame Extractor", "Grab a frame for YouTube thumbnails", "Youtube"],
    ["YouTube Shorts Resizer", "Resize videos for YouTube Shorts", "Smartphone"],
    ["TikTok Video Resizer", "Resize videos for TikTok", "Smartphone"],
    ["Instagram Reel Resizer", "Resize videos for Instagram Reels", "Smartphone"],
    ["Instagram Story Resizer", "Resize videos for Instagram Stories", "Smartphone"],
    ["Facebook Video Resizer", "Resize videos for Facebook", "Facebook"],
    ["LinkedIn Video Resizer", "Resize videos for LinkedIn", "Linkedin"],
  ],
  "Analysis & Metadata": [
    ["Video Metadata Viewer", "Inspect video metadata", "Info"],
    ["Video Bitrate Checker", "Check video bitrate", "Activity"],
    ["Video Codec Detector", "Detect video codecs", "Code2"],
    ["Video Duration Calculator", "Calculate total video duration", "Clock"],
    ["FPS Analyzer", "Analyze frames per second", "Gauge"],
    ["Resolution Analyzer", "Analyze video resolution", "Monitor"],
    ["Aspect Ratio Checker", "Check aspect ratio", "Ratio"],
    ["Color Profile Viewer", "View video color profile", "Palette"],
    ["Video Timecode Calculator", "Calculate timecodes", "Clock"],
    ["Video Timecode Converter", "Convert between timecode formats", "Clock"],
  ],
  "Recording": [
    ["Screen Recorder", "Record your screen", "MonitorPlay"],
    ["Webcam Recorder", "Record from your webcam", "Video"],
    ["Camera Test", "Test your camera", "Camera"],
    ["Screen + Webcam Recorder", "Record screen with webcam overlay", "MonitorPlay"],
    ["Video Snapshot Tool", "Capture a snapshot from video", "Camera"],
  ],
  "Video Utilities": [
    ["Video Filename Cleaner", "Clean up video filenames", "FileText"],
    ["Video Timestamp Generator", "Generate timestamps", "Clock"],
    ["Video Chapter Generator", "Generate chapter markers", "List"],
    ["Batch Rename Helper", "Batch rename video files", "Files"],
    ["Video Size Estimator", "Estimate video size", "Calculator"],
    ["Video Hash Generator", "Generate a hash for a video", "Hash"],
    ["Video Storyboard Generator", "Generate a storyboard", "LayoutGrid"],
    ["Drop Frame Calculator", "Calculate drop-frame timecodes", "Calculator"],
  ],
  "Creator Tools": [
    ["Intro Maker", "Create video intros", "PlayCircle"],
    ["Outro Maker", "Create video outros", "StopCircle"],
    ["Lower Third Generator", "Generate lower thirds", "Layout"],
    ["End Screen Creator", "Build YouTube end screens", "Square"],
    ["YouTube Chapter Formatter", "Format chapters for YouTube", "List"],
    ["Video Title Card Creator", "Create title cards", "Type"],
    ["Video End Card Generator", "Generate end cards", "Square"],
    ["Video Bumper Creator", "Create video bumpers", "Film"],
    ["Video Player Embed Generator", "Generate embed code for video players", "Code"],
    ["Video Preview Generator", "Generate video previews", "Eye"],
  ],
  "Streaming & Technical": [
    ["Streaming Bitrate Calculator", "Calculate streaming bitrate", "Calculator"],
    ["HLS Manifest Generator", "Generate HLS manifests", "Code2"],
    ["DASH Manifest Generator", "Generate DASH manifests", "Code2"],
    ["Video Codec Reference Guide", "Reference guide to codecs", "BookOpen"],
    ["Streaming Resolution Guide", "Streaming resolution reference", "BookOpen"],
    ["OBS Settings Calculator", "Calculate optimal OBS settings", "Settings"],
  ],
  "Developer Video Tools": [
    ["Base64 Video Encoder", "Encode videos to Base64", "Code"],
    ["Base64 Video Decoder", "Decode Base64 to video", "Code"],
    ["Video Hex Viewer", "View raw video bytes", "Code2"],
    ["MP4 Metadata Inspector", "Inspect MP4 metadata", "Info"],
    ["Codec Information Viewer", "View codec details", "Info"],
  ],
};

const LIVE_SLUGS = new Set<string>(["mp4-converter"]);

export const TOOLS: Tool[] = Object.entries(CATEGORIES).flatMap(
  ([category, items]) =>
    items.map(([name, description, icon]) => {
      const slug = slugify(name);
      return {
        slug,
        name,
        description,
        category,
        icon,
        status: LIVE_SLUGS.has(slug) ? "live" : "soon",
      } satisfies Tool;
    }),
);

export const CATEGORY_ORDER = Object.keys(CATEGORIES);

export const TOOLS_BY_CATEGORY: Record<string, Tool[]> = CATEGORY_ORDER.reduce(
  (acc, cat) => {
    acc[cat] = TOOLS.filter((t) => t.category === cat);
    return acc;
  },
  {} as Record<string, Tool[]>,
);

export const TOOL_BY_SLUG: Record<string, Tool> = Object.fromEntries(
  TOOLS.map((t) => [t.slug, t]),
);

export const SEARCH_REGISTRY: ToolResult[] = TOOLS.map((tool) => ({
  name: tool.name,
  description: tool.description,
  slug: tool.slug,
  href: `/video/tools/${tool.slug}`,
  category: tool.category,
  isBuilt: tool.status === "live",
}));