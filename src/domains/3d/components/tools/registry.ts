"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";

const ModelViewer = dynamic(() => import("./ViewingTools").then(m => m.ModelViewer), { ssr: false });
const GLTFInspector = dynamic(() => import("./ViewingTools").then(m => m.GLTFInspector), { ssr: false });
const OBJInspector = dynamic(() => import("./ViewingTools").then(m => m.OBJInspector), { ssr: false });
const STLViewer = dynamic(() => import("./ViewingTools").then(m => m.STLViewer), { ssr: false });
const FBXViewer = dynamic(() => import("./ViewingTools").then(m => m.FBXViewer), { ssr: false });
const MeshStatsTool = dynamic(() => import("./ViewingTools").then(m => m.MeshStatsTool), { ssr: false });
const SceneExplorer = dynamic(() => import("./ViewingTools").then(m => m.SceneExplorer), { ssr: false });
const BoundingBoxInspector = dynamic(() => import("./ViewingTools").then(m => m.BoundingBoxInspector), { ssr: false });
const NormalMapViewer = dynamic(() => import("./ViewingTools").then(m => m.NormalMapViewer), { ssr: false });
const UVMapInspector = dynamic(() => import("./ViewingTools").then(m => m.UVMapInspector), { ssr: false });
const WireframeViewer = dynamic(() => import("./ViewingTools").then(m => m.WireframeViewer), { ssr: false });
const VertexCountAnalyzer = dynamic(() => import("./ViewingTools").then(m => m.VertexCountAnalyzer), { ssr: false });

export const TOOL_COMPONENTS: Record<string, ComponentType> = {
  "3d-model-viewer-gltf-obj-stl": ModelViewer,
  "gltf-inspector": GLTFInspector,
  "obj-inspector": OBJInspector,
  "stl-viewer": STLViewer,
  "fbx-viewer-via-conversion": FBXViewer,
  "3d-mesh-stats-tool": MeshStatsTool,
  "3d-scene-explorer": SceneExplorer,
  "3d-bounding-box-inspector": BoundingBoxInspector,
  "3d-normal-map-viewer": NormalMapViewer,
  "uv-map-inspector": UVMapInspector,
  "3d-wireframe-viewer": WireframeViewer,
  "3d-vertex-count-analyzer": VertexCountAnalyzer,
};
