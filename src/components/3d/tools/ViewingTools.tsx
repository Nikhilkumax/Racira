"use client";

import { useState } from "react";
import * as THREE from "three";
import { Viewer3DPanel, StatBlock, ToolEmpty } from "./Viewer3DPanel";
import { computeStats, type MeshStats } from "@/lib/3d/three-utils";

// ============ 1. 3D Model Viewer ============
export function ModelViewer() {
  const [stats, setStats] = useState<MeshStats | null>(null);
  return (
    <Viewer3DPanel
      onLoaded={(m) => setStats(computeStats(m.object))}
      sidebar={
        stats ? (
          <div className="space-y-2">
            <StatBlock label="Meshes" value={stats.meshes} />
            <StatBlock label="Triangles" value={stats.triangles.toLocaleString()} />
            <StatBlock label="Vertices" value={stats.vertices.toLocaleString()} />
            <StatBlock label="Materials" value={stats.materials} />
          </div>
        ) : <ToolEmpty>Upload a GLTF, OBJ, or STL file to view it in 3D.</ToolEmpty>
      }
    />
  );
}

// ============ 2. GLTF Inspector ============
export function GLTFInspector() {
  const [json, setJson] = useState<string | null>(null);
  const [summary, setSummary] = useState<Record<string, number>>({});
  return (
    <Viewer3DPanel
      accept=".gltf,.glb"
      onLoaded={(m) => {
        if (!m.raw) return;
        const gltf = m.raw;
        setSummary({
          scenes: gltf.scenes?.length || 0,
          animations: gltf.animations?.length || 0,
          cameras: gltf.cameras?.length || 0,
          materials: gltf.parser?.json?.materials?.length || 0,
          textures: gltf.parser?.json?.textures?.length || 0,
          meshes: gltf.parser?.json?.meshes?.length || 0,
        });
        setJson(JSON.stringify(gltf.parser?.json ?? {}, null, 2));
      }}
      sidebar={
        json ? (
          <>
            {Object.entries(summary).map(([k, v]) => <StatBlock key={k} label={k} value={v} />)}
          </>
        ) : <ToolEmpty>Upload a .gltf or .glb file to inspect its structure.</ToolEmpty>
      }
    />
  );
}

// ============ 3. OBJ Inspector ============
export function OBJInspector() {
  const [info, setInfo] = useState<Record<string, number> | null>(null);
  return (
    <Viewer3DPanel
      accept=".obj"
      onLoaded={(m) => {
        const text: string = m.raw;
        setInfo({
          vertices: (text.match(/^v\s/gm) || []).length,
          normals: (text.match(/^vn\s/gm) || []).length,
          uvs: (text.match(/^vt\s/gm) || []).length,
          faces: (text.match(/^f\s/gm) || []).length,
          groups: (text.match(/^g\s/gm) || []).length,
          objects: (text.match(/^o\s/gm) || []).length,
          materials: (text.match(/^usemtl\s/gm) || []).length,
        });
      }}
      sidebar={
        info ? <>{Object.entries(info).map(([k, v]) => <StatBlock key={k} label={k} value={v.toLocaleString()} />)}</>
              : <ToolEmpty>Upload a .obj file.</ToolEmpty>
      }
    />
  );
}

// ============ 4. STL Viewer ============
export function STLViewer() {
  const [stats, setStats] = useState<MeshStats | null>(null);
  return (
    <Viewer3DPanel
      accept=".stl"
      onLoaded={(m) => setStats(computeStats(m.object))}
      sidebar={
        stats ? (
          <>
            <StatBlock label="Triangles" value={stats.triangles.toLocaleString()} />
            <StatBlock label="Vertices" value={stats.vertices.toLocaleString()} />
            <StatBlock label="Width (X)" value={stats.bbox.x} />
            <StatBlock label="Height (Y)" value={stats.bbox.y} />
            <StatBlock label="Depth (Z)" value={stats.bbox.z} />
          </>
        ) : <ToolEmpty>Upload a binary or ASCII .stl file.</ToolEmpty>
      }
    />
  );
}

// ============ 5. FBX Viewer ============
export function FBXViewer() {
  const [stats, setStats] = useState<MeshStats | null>(null);
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-primary/30 bg-primary-soft p-3 text-xs text-primary">
        FBX is parsed directly in-browser via the Three.js FBX loader. For best performance, convert complex FBX files to GLTF.
      </div>
      <Viewer3DPanel
        accept=".fbx,.gltf,.glb"
        onLoaded={(m) => setStats(computeStats(m.object))}
        sidebar={
          stats ? (
            <>
              <StatBlock label="Meshes" value={stats.meshes} />
              <StatBlock label="Triangles" value={stats.triangles.toLocaleString()} />
              <StatBlock label="Vertices" value={stats.vertices.toLocaleString()} />
            </>
          ) : <ToolEmpty>Upload .fbx (or .gltf for fallback).</ToolEmpty>
        }
      />
    </div>
  );
}

// ============ 6. 3D Mesh Stats Tool ============
export function MeshStatsTool() {
  const [stats, setStats] = useState<MeshStats | null>(null);
  return (
    <Viewer3DPanel
      onLoaded={(m) => setStats(computeStats(m.object))}
      sidebar={
        stats ? (
          <>
            <StatBlock label="Meshes" value={stats.meshes} />
            <StatBlock label="Vertices" value={stats.vertices.toLocaleString()} />
            <StatBlock label="Triangles" value={stats.triangles.toLocaleString()} />
            <StatBlock label="Materials" value={stats.materials} />
            <StatBlock label="Textures" value={stats.textures} />
          </>
        ) : <ToolEmpty>Upload any 3D model for full statistics.</ToolEmpty>
      }
    />
  );
}

// ============ 7. 3D Scene Explorer ============
export function SceneExplorer() {
  const [tree, setTree] = useState<any[] | null>(null);
  function build(o: THREE.Object3D, depth = 0): any {
    return {
      name: o.name || o.type,
      type: o.type,
      depth,
      children: o.children.map((c) => build(c, depth + 1)),
    };
  }
  function flatten(n: any, out: any[] = []) {
    out.push(n);
    n.children.forEach((c: any) => flatten(c, out));
    return out;
  }
  return (
    <Viewer3DPanel
      onLoaded={(m) => setTree(flatten(build(m.object)))}
      sidebar={
        tree ? (
          <div className="max-h-[460px] overflow-auto rounded-lg border border-border bg-muted/30 p-2 text-xs font-mono">
            {tree.map((n, i) => (
              <div key={i} style={{ paddingLeft: n.depth * 12 }} className="py-0.5">
                <span className="text-primary">{n.type}</span> <span className="text-muted-foreground">{n.name}</span>
              </div>
            ))}
          </div>
        ) : <ToolEmpty>Upload a model to explore its scene graph.</ToolEmpty>
      }
    />
  );
}

// ============ 8. 3D Bounding Box Inspector ============
export function BoundingBoxInspector() {
  const [box, setBox] = useState<{ size: THREE.Vector3; center: THREE.Vector3 } | null>(null);
  return (
    <Viewer3DPanel
      onLoaded={(m, v) => {
        const b = new THREE.Box3().setFromObject(m.object);
        const size = b.getSize(new THREE.Vector3());
        const center = b.getCenter(new THREE.Vector3());
        setBox({ size, center });
        const helper = new THREE.Box3Helper(b, new THREE.Color(0x0f766e));
        v.scene.add(helper);
      }}
      sidebar={
        box ? (
          <>
            <StatBlock label="Width (X)" value={box.size.x.toFixed(3)} />
            <StatBlock label="Height (Y)" value={box.size.y.toFixed(3)} />
            <StatBlock label="Depth (Z)" value={box.size.z.toFixed(3)} />
            <StatBlock label="Center" value={`${box.center.x.toFixed(2)}, ${box.center.y.toFixed(2)}, ${box.center.z.toFixed(2)}`} />
            <StatBlock label="Diagonal" value={box.size.length().toFixed(3)} />
          </>
        ) : <ToolEmpty>Upload a model to compute its bounding box.</ToolEmpty>
      }
    />
  );
}

// ============ 9. 3D Normal Map Viewer ============
export function NormalMapViewer() {
  const [name, setName] = useState<string | null>(null);
  function handle(file: File, container: HTMLDivElement) {
    const url = URL.createObjectURL(file);
    setName(file.name);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    cam.position.set(0, 0, 3);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    const resize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    };
    resize();
    new ResizeObserver(resize).observe(container);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(3, 5, 4);
    scene.add(dir);
    const tex = new THREE.TextureLoader().load(url);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, normalMap: tex, roughness: 0.5 });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), mat);
    scene.add(sphere);
    let raf = 0;
    const loop = () => { raf = requestAnimationFrame(loop); sphere.rotation.y += 0.005; renderer.render(scene, cam); };
    loop();
    return () => { cancelAnimationFrame(raf); renderer.dispose(); };
  }
  const ref = useState<HTMLDivElement | null>(null);
  return (
    <div className="space-y-3">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
        Upload normal map (PNG/JPG)
        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && ref[0]) handle(f, ref[0]);
        }} />
      </label>
      {name && <span className="ml-2 text-xs text-muted-foreground">{name}</span>}
      <div ref={(el) => ref[1](el)} className="h-[480px] w-full rounded-lg border border-border bg-gradient-to-br from-muted/30 to-primary-soft/30" />
    </div>
  );
}

// ============ 10. UV Map Inspector ============
export function UVMapInspector() {
  const canvasRef = useState<HTMLCanvasElement | null>(null);
  const [count, setCount] = useState<number>(0);
  return (
    <Viewer3DPanel
      accept=".gltf,.glb,.obj,.fbx"
      onLoaded={(m) => {
        const canvas = canvasRef[0];
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        const W = canvas.width = 512, H = canvas.height = 512;
        ctx.fillStyle = "#0b1f1c"; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 0.5;
        let meshCount = 0;
        m.object.traverse((o: any) => {
          if (o.isMesh && o.geometry?.attributes?.uv && o.geometry.index) {
            meshCount++;
            const uv = o.geometry.attributes.uv;
            const idx = o.geometry.index;
            for (let i = 0; i < idx.count; i += 3) {
              const a = idx.getX(i), b = idx.getX(i + 1), c = idx.getX(i + 2);
              ctx.beginPath();
              ctx.moveTo(uv.getX(a) * W, (1 - uv.getY(a)) * H);
              ctx.lineTo(uv.getX(b) * W, (1 - uv.getY(b)) * H);
              ctx.lineTo(uv.getX(c) * W, (1 - uv.getY(c)) * H);
              ctx.closePath();
              ctx.stroke();
            }
          }
        });
        setCount(meshCount);
      }}
      sidebar={
        <>
          <StatBlock label="Meshes with UVs" value={count} />
          <canvas ref={(el) => canvasRef[1](el)} className="w-full rounded-lg border border-border" />
        </>
      }
    />
  );
}

// ============ 11. 3D Wireframe Viewer ============
export function WireframeViewer() {
  const [on, setOn] = useState(true);
  const [viewer, setViewer] = useState<any>(null);
  return (
    <Viewer3DPanel
      onLoaded={(_m, v) => { setViewer(v); v.setWireframe(on); }}
      controls={
        <label className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
          <input type="checkbox" checked={on} onChange={(e) => { setOn(e.target.checked); viewer?.setWireframe(e.target.checked); }} />
          Wireframe
        </label>
      }
      sidebar={<ToolEmpty>Upload a model and toggle wireframe rendering.</ToolEmpty>}
    />
  );
}

// ============ 12. Vertex Count Analyzer ============
export function VertexCountAnalyzer() {
  const [stats, setStats] = useState<MeshStats | null>(null);
  return (
    <Viewer3DPanel
      onLoaded={(m) => setStats(computeStats(m.object))}
      sidebar={
        stats ? (
          <div className="max-h-[460px] overflow-auto rounded-lg border border-border bg-muted/30 p-3 text-xs">
            <div className="mb-2 font-semibold">Total: {stats.vertices.toLocaleString()} verts · {stats.triangles.toLocaleString()} tris</div>
            <table className="w-full">
              <thead className="text-muted-foreground">
                <tr><th className="text-left py-1">Mesh</th><th className="text-right">Verts</th><th className="text-right">Tris</th></tr>
              </thead>
              <tbody>
                {stats.perMesh.map((p, i) => (
                  <tr key={i} className="border-t border-border/50">
                    <td className="py-1 truncate max-w-[140px]">{p.name}</td>
                    <td className="text-right tabular-nums">{p.vertices.toLocaleString()}</td>
                    <td className="text-right tabular-nums">{p.triangles.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <ToolEmpty>Upload a model for per-mesh vertex counts.</ToolEmpty>
      }
    />
  );
}
