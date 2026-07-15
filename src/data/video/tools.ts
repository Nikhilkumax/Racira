import { AArrowDown, AArrowUp, ArrowBigDown, ArrowBigDownDash, ArrowBigLeft, ArrowBigLeftDash, ArrowBigRight, ArrowBigRightDash, ArrowBigUp, ArrowBigUpDash, ArrowDown, ArrowDown01, ALargeSmall, Accessibility, Activity, ActivitySquare, AirVent, Airplay, LucideScissors, LucideScissorsLineDashed, LucideScissorsSquare, ChartNoAxesCombined, Combine, LucideScissorsSquareDashedBottom, AlarmCheck, LucideRotate3D, LucideRotate3d, LucideRotateCcw, CircleGauge, Grid, LucideMinimize, LucideMinimize2, BadgeInfo, Minimize, AlarmClock, Minimize2, Info, AlarmClockCheck, LucideShrink, ArrowDown10, ArrowDownAZ, ArrowDownAz, ArrowDownCircle, ArrowDownFromLine, ArrowDownLeft, ArrowDownLeftFromCircle, BookImage, FileImage, Grid2X2, Image, Grid2X2Plus, ImageDown, ImageMinus, AlarmClockMinus, ArrowDownLeftFromSquare, AlarmClockOff, AlarmClockPlus, CalendarClock, FileMusic, KeyboardMusic, ListMusic, LucideFileMusic, Captions, CaptionsOff, LucideCaptions, LucideChartNoAxesCombined, LucideCaptionsOff, BookType, ClipboardType, ArrowDownLeftSquare, ArrowDownNarrowWide, ArrowDownRight, ArrowDownRightFromCircle, FileType, FileType2, ArrowDownRightFromSquare, LucideCombine, LucideBookType, LucideClipboardType, LucideFileType, LucidePalette, Palette, CloudSun, ArrowDownRightSquare, AlarmMinus, AlarmPlus, CloudSunRain, LucideCloudSun, LucideStamp, Stamp, LucideCloudSunRain, LucideSun, AlarmSmoke, Album, BugPlay, Shrink, LucideRotateCcwSquare, CirclePlay, ImageOff, ImagePlay, LucidePackage, LucidePackage2, LucidePackageCheck, LucidePackageMinus, LucidePackageOpen, LucidePackagePlus, LucideBadgeInfo, LucideInfo, Barcode, Clock, Gauge, LucideMonitor, IterationCcw, LucideSunDim, Clock1, ArrowDownSquare, LucideMonitorPlay, MonitorPlay, AlertCircle, FileVideo, FileVideo2, File, Clock10, Clock11, FileArchive, LucidePackageSearch, Code, Grid2x2, Grid2x2Check, LucidePlayCircle, PlayCircle, AlertOctagon, ListVideo, LucideYoutube, AlertTriangle, AlignCenter, LucideStopCircle, AlignCenterHorizontal, AlignCenterVertical, Code2, LucideRadio, LucideRadioReceiver, CodeSquare, LucideMonitorCheck, LucideRadioTower, CodeXml, Codepen, Codesandbox, FileCode, FileCode2 } from "lucide-react";
import { ToolResult } from "@/components/CategorySearch";

export type ToolStatus = "live" | "soon";

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  status: ToolStatus;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

type RawTool = [name: string, description: string, icon: any];

const CATEGORIES: Record<string, RawTool[]> = {
  "Video Conversion": [
    ["MP4 Converter", "Convert any video to MP4 in your browser", AArrowDown],
    ["WebM Converter", "Convert videos to WebM format", AArrowUp],
    ["MOV Converter", "Convert videos to MOV format", ArrowBigDown],
    ["AVI Converter", "Convert videos to AVI format", ArrowBigDownDash],
    ["MKV Converter", "Convert videos to MKV format", ArrowBigLeft],
    ["FLV Converter", "Convert videos to FLV format", ArrowBigLeftDash],
    ["WMV Converter", "Convert videos to WMV format", ArrowBigRight],
    ["M4V Converter", "Convert videos to M4V format", ArrowBigRightDash],
    ["MPEG Converter", "Convert videos to MPEG format", ArrowBigUp],
    ["Video Format Converter", "Universal video format converter", ArrowBigUpDash],
    ["H.264 to H.265 Converter", "Re-encode H.264 to HEVC", ArrowDown],
    ["VP8 to VP9 Converter", "Re-encode VP8 to VP9", ArrowDown01],
    ["MTS to MP4", "Convert MTS files to MP4", ALargeSmall],
    ["TS to MP4", "Convert TS files to MP4", Accessibility],
    ["F4V to MP4", "Convert F4V files to MP4", Activity],
    ["3GP to MP4", "Convert 3GP files to MP4", ActivitySquare],
    ["OGV to MP4", "Convert OGV files to MP4", AirVent],
    ["Video to WebM", "Convert any video to WebM", Airplay],
  ],
  "Video Trimming & Editing": [
    ["Video Trimmer", "Trim start and end of a video", LucideScissors],
    ["Video Cutter", "Cut out sections of a video", LucideScissorsLineDashed],
    ["Video Splitter", "Split a video into parts", LucideScissorsSquare],
    ["Video Merger", "Merge multiple videos together", ChartNoAxesCombined],
    ["Video Joiner", "Join videos end-to-end", Combine],
    ["Video Cropper", "Crop video frames", LucideScissorsSquareDashedBottom],
    ["Video Rotator", "Rotate video orientation", AlarmCheck],
    ["Video Flipper", "Flip videos horizontally or vertically", LucideRotate3D],
    ["Video Reverser", "Play video in reverse", LucideRotate3d],
    ["Video Loop Creator", "Loop videos any number of times", LucideRotateCcw],
    ["Video Speed Changer", "Speed up or slow down a video", CircleGauge],
    ["Video Frame Extractor", "Extract individual frames", Grid],
  ],
  "Video Compression & Optimization": [
    ["Video Compressor", "Reduce video file size", LucideMinimize],
    ["Video Size Reducer", "Shrink large video files", LucideMinimize2],
    ["Video Bitrate Optimizer", "Optimize bitrate for size and quality", BadgeInfo],
    ["Resolution Reducer", "Downscale video resolution", Minimize],
    ["Video Quality Optimizer", "Balance quality and file size", AlarmClock],
    ["Video File Size Calculator", "Estimate video file size", Minimize2],
    ["Video Bitrate Ladder Calculator", "Plan bitrate ladders for streaming", Info],
    ["ABR Ladder Generator", "Generate adaptive bitrate ladders", AlarmClockCheck],
  ],
  "Video Resolution Tools": [
    ["Video Resizer", "Resize video to any dimensions", LucideShrink],
    ["720p Converter", "Convert videos to 720p", ArrowDown10],
    ["1080p Converter", "Convert videos to 1080p", ArrowDownAZ],
    ["1440p Converter", "Convert videos to 1440p", ArrowDownAz],
    ["4K Converter", "Convert videos to 4K", ArrowDownCircle],
    ["Aspect Ratio Converter", "Change video aspect ratio", ArrowDownFromLine],
    ["Portrait to Landscape Converter", "Switch portrait videos to landscape", ArrowDownLeft],
    ["Landscape to Portrait Converter", "Switch landscape videos to portrait", ArrowDownLeftFromCircle],
  ],
  "Video to Image": [
    ["Video to JPG", "Export video frames as JPG images", BookImage],
    ["Video to PNG", "Export video frames as PNG images", FileImage],
    ["Frame Extractor", "Extract frames at any timestamp", Grid2X2],
    ["Thumbnail Generator", "Generate thumbnails from videos", Image],
    ["Contact Sheet Creator", "Create a contact sheet of frames", Grid2X2Plus],
    ["Video Thumbnail Grid", "Build a grid of video thumbnails", ImageDown],
    ["Video Thumbnail Extractor", "Pull thumbnails at exact times", ImageMinus],
    ["Video Proof Sheet", "Create a video proof sheet", AlarmClockMinus],
  ],
  "Image to Video": [
    ["Image to Video Converter", "Turn images into a video", ArrowDownLeftFromSquare],
    ["Slideshow Maker", "Create a slideshow video", AlarmClockOff],
    ["Photo Montage Creator", "Combine photos into a montage", AlarmClockPlus],
    ["Timelapse Creator", "Create a timelapse from photos", CalendarClock],
  ],
  "Audio & Video": [
    ["Remove Audio from Video", "Strip audio from any video", FileMusic],
    ["Replace Video Audio", "Replace a video's audio track", KeyboardMusic],
    ["Add Background Music", "Add background music to a video", ListMusic],
    ["Mute Video", "Mute audio in a video", LucideFileMusic],
  ],
  "Subtitle Tools": [
    ["Subtitle Generator Template", "Templates to start subtitling", Captions],
    ["SRT Editor", "Edit SRT subtitle files", CaptionsOff],
    ["VTT Editor", "Edit VTT subtitle files", LucideCaptions],
    ["Subtitle Merger", "Merge two subtitle tracks", LucideChartNoAxesCombined],
    ["Subtitle Embedder", "Embed subtitles into a video", LucideCaptionsOff],
    ["Subtitle Extractor", "Extract subtitles from a video", BookType],
    ["Subtitle Timing Adjuster", "Adjust subtitle timings", ClipboardType],
    ["SRT to VTT Converter", "Convert SRT to VTT", ArrowDownLeftSquare],
    ["VTT to SRT Converter", "Convert VTT to SRT", ArrowDownNarrowWide],
    ["SRT to ASS Converter", "Convert SRT to ASS", ArrowDownRight],
    ["ASS to SRT Converter", "Convert ASS to SRT", ArrowDownRightFromCircle],
    ["SRT Timestamp Adjuster", "Shift SRT timestamps", FileType],
    ["Subtitle Delay Fixer", "Fix subtitle delay issues", FileType2],
    ["Subtitle Frame Rate Converter", "Convert subtitle frame rate", ArrowDownRightFromSquare],
    ["Dual Subtitle Merger", "Merge dual-language subtitles", LucideCombine],
    ["Subtitle Font Styler", "Style subtitle fonts", LucideBookType],
    ["Subtitle Timing Extractor", "Extract cue timings", LucideClipboardType],
    ["Subtitle Preview Tool", "Preview subtitles over a video", LucideFileType],
  ],
  "Video Effects": [
    ["Brightness Adjuster", "Adjust video brightness", LucidePalette],
    ["Contrast Adjuster", "Adjust video contrast", Palette],
    ["Saturation Adjuster", "Adjust video saturation", CloudSun],
    ["Grayscale Converter", "Convert video to grayscale", ArrowDownRightSquare],
    ["Blur Effect", "Apply blur to a video", AlarmMinus],
    ["Sharpen Effect", "Sharpen video frames", AlarmPlus],
    ["Sepia Effect", "Apply a sepia tone", CloudSunRain],
    ["Color Filter Tool", "Apply color filters", LucideCloudSun],
    ["Video Watermark Tool", "Add a watermark to videos", LucideStamp],
    ["Text Overlay Tool", "Overlay text on video", Stamp],
    ["Video Color Grading", "Grade video colors", LucideCloudSunRain],
    ["Video LUT Applier", "Apply LUTs to a video", LucideSun],
    ["Video Denoise", "Reduce noise in a video", AlarmSmoke],
    ["Video Stabilizer", "Stabilize shaky footage", Album],
  ],
  "GIF Tools": [
    ["GIF to Video", "Convert GIF to a video file", BugPlay],
    ["GIF Resizer", "Resize animated GIFs", Shrink],
    ["GIF Loop Creator", "Create looping GIFs", LucideRotateCcwSquare],
    ["GIF to MP4", "Convert GIF to MP4", CirclePlay],
    ["Animated Thumbnail Creator", "Create animated thumbnails", ImageOff],
  ],
  "Social Media Video": [
    ["YouTube Thumbnail Frame Extractor", "Grab a frame for YouTube thumbnails", ImagePlay],
    ["YouTube Shorts Resizer", "Resize videos for YouTube Shorts", LucidePackage],
    ["TikTok Video Resizer", "Resize videos for TikTok", LucidePackage2],
    ["Instagram Reel Resizer", "Resize videos for Instagram Reels", LucidePackageCheck],
    ["Instagram Story Resizer", "Resize videos for Instagram Stories", LucidePackageMinus],
    ["Facebook Video Resizer", "Resize videos for Facebook", LucidePackageOpen],
    ["LinkedIn Video Resizer", "Resize videos for LinkedIn", LucidePackagePlus],
  ],
  "Analysis & Metadata": [
    ["Video Metadata Viewer", "Inspect video metadata", LucideBadgeInfo],
    ["Video Bitrate Checker", "Check video bitrate", LucideInfo],
    ["Video Codec Detector", "Detect video codecs", Barcode],
    ["Video Duration Calculator", "Calculate total video duration", Clock],
    ["FPS Analyzer", "Analyze frames per second", Gauge],
    ["Resolution Analyzer", "Analyze video resolution", LucideMonitor],
    ["Aspect Ratio Checker", "Check aspect ratio", IterationCcw],
    ["Color Profile Viewer", "View video color profile", LucideSunDim],
    ["Video Timecode Calculator", "Calculate timecodes", Clock1],
    ["Video Timecode Converter", "Convert between timecode formats", ArrowDownSquare],
  ],
  "Recording": [
    ["Screen Recorder", "Record your screen", LucideMonitorPlay],
    ["Webcam Recorder", "Record from your webcam", MonitorPlay],
    ["Camera Test", "Test your camera", AlertCircle],
    ["Screen + Webcam Recorder", "Record screen with webcam overlay", FileVideo],
    ["Video Snapshot Tool", "Capture a snapshot from video", FileVideo2],
  ],
  "Video Utilities": [
    ["Video Filename Cleaner", "Clean up video filenames", File],
    ["Video Timestamp Generator", "Generate timestamps", Clock10],
    ["Video Chapter Generator", "Generate chapter markers", Clock11],
    ["Batch Rename Helper", "Batch rename video files", FileArchive],
    ["Video Size Estimator", "Estimate video size", LucidePackageSearch],
    ["Video Hash Generator", "Generate a hash for a video", Code],
    ["Video Storyboard Generator", "Generate a storyboard", Grid2x2],
    ["Drop Frame Calculator", "Calculate drop-frame timecodes", Grid2x2Check],
  ],
  "Creator Tools": [
    ["Intro Maker", "Create video intros", LucidePlayCircle],
    ["Outro Maker", "Create video outros", PlayCircle],
    ["Lower Third Generator", "Generate lower thirds", AlertOctagon],
    ["End Screen Creator", "Build YouTube end screens", ListVideo],
    ["YouTube Chapter Formatter", "Format chapters for YouTube", LucideYoutube],
    ["Video Title Card Creator", "Create title cards", AlertTriangle],
    ["Video End Card Generator", "Generate end cards", AlignCenter],
    ["Video Bumper Creator", "Create video bumpers", LucideStopCircle],
    ["Video Player Embed Generator", "Generate embed code for video players", AlignCenterHorizontal],
    ["Video Preview Generator", "Generate video previews", AlignCenterVertical],
  ],
  "Streaming & Technical": [
    ["Streaming Bitrate Calculator", "Calculate streaming bitrate", Code2],
    ["HLS Manifest Generator", "Generate HLS manifests", LucideRadio],
    ["DASH Manifest Generator", "Generate DASH manifests", LucideRadioReceiver],
    ["Video Codec Reference Guide", "Reference guide to codecs", CodeSquare],
    ["Streaming Resolution Guide", "Streaming resolution reference", LucideMonitorCheck],
    ["OBS Settings Calculator", "Calculate optimal OBS settings", LucideRadioTower],
  ],
  "Developer Video Tools": [
    ["Base64 Video Encoder", "Encode videos to Base64", CodeXml],
    ["Base64 Video Decoder", "Decode Base64 to video", Codepen],
    ["Video Hex Viewer", "View raw video bytes", Codesandbox],
    ["MP4 Metadata Inspector", "Inspect MP4 metadata", FileCode],
    ["Codec Information Viewer", "View codec details", FileCode2],
  ],
};

const LIVE_SLUGS = new Set<string>([]);

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