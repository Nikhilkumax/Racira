import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type LoadedModel = {
  object: THREE.Object3D;
  raw?: any;
  ext: string;
};

export async function loadModelFromFile(file: File): Promise<LoadedModel> {
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop() || "";
  const buffer = await file.arrayBuffer();

  if (ext === "gltf" || ext === "glb") {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.parse(buffer, "", (gltf) => resolve({ object: gltf.scene, raw: gltf, ext }), reject);
    });
  }
  if (ext === "obj") {
    const loader = new OBJLoader();
    const text = new TextDecoder().decode(buffer);
    return { object: loader.parse(text), raw: text, ext };
  }
  if (ext === "stl") {
    const loader = new STLLoader();
    const geom = loader.parse(buffer);
    const mat = new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.1, roughness: 0.6 });
    const mesh = new THREE.Mesh(geom, mat);
    const group = new THREE.Group();
    group.add(mesh);
    return { object: group, raw: geom, ext };
  }
  if (ext === "fbx") {
    const loader = new FBXLoader();
    return { object: loader.parse(buffer, ""), ext };
  }
  throw new Error(`Unsupported file type: .${ext}`);
}

export function createViewer(container: HTMLElement) {
  const scene = new THREE.Scene();
  scene.background = null;
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 5000);
  camera.position.set(3, 3, 3);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(5, 10, 7);
  scene.add(dir);

  const grid = new THREE.GridHelper(10, 20, 0x0f766e, 0x999999);
  (grid.material as THREE.Material).opacity = 0.25;
  (grid.material as THREE.Material).transparent = true;
  scene.add(grid);

  let modelRoot: THREE.Object3D | null = null;
  let raf = 0;

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  function loop() {
    raf = requestAnimationFrame(loop);
    controls.update();
    renderer.render(scene, camera);
  }
  loop();

  function frameObject(obj: THREE.Object3D) {
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    obj.position.x += -center.x;
    obj.position.y += -center.y;
    obj.position.z += -center.z;
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const fov = camera.fov * (Math.PI / 180);
    const dist = (maxDim / 2) / Math.tan(fov / 2) * 1.6;
    camera.position.set(dist, dist * 0.8, dist);
    camera.near = dist / 100;
    camera.far = dist * 100;
    camera.updateProjectionMatrix();
    controls.target.set(0, 0, 0);
    controls.update();
  }

  return {
    scene, camera, renderer, controls,
    setModel(obj: THREE.Object3D) {
      if (modelRoot) scene.remove(modelRoot);
      modelRoot = obj;
      scene.add(obj);
      frameObject(obj);
    },
    getModel: () => modelRoot,
    setWireframe(on: boolean) {
      if (!modelRoot) return;
      modelRoot.traverse((o: any) => {
        if (o.isMesh) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m: any) => { if (m) m.wireframe = on; });
        }
      });
    },
    showGrid(on: boolean) { grid.visible = on; },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

export type MeshStats = {
  meshes: number;
  vertices: number;
  triangles: number;
  materials: number;
  textures: number;
  bbox: { x: number; y: number; z: number };
  perMesh: { name: string; vertices: number; triangles: number }[];
};

export function computeStats(root: THREE.Object3D): MeshStats {
  let meshes = 0, vertices = 0, triangles = 0;
  const mats = new Set<any>(), texs = new Set<any>();
  const perMesh: MeshStats["perMesh"] = [];
  root.traverse((o: any) => {
    if (o.isMesh && o.geometry) {
      meshes++;
      const g: THREE.BufferGeometry = o.geometry;
      const vCount = g.attributes.position ? g.attributes.position.count : 0;
      const tCount = g.index ? g.index.count / 3 : vCount / 3;
      vertices += vCount;
      triangles += tCount;
      perMesh.push({ name: o.name || `Mesh${meshes}`, vertices: vCount, triangles: Math.floor(tCount) });
      const ms = Array.isArray(o.material) ? o.material : [o.material];
      ms.forEach((m: any) => {
        if (!m) return;
        mats.add(m);
        ["map", "normalMap", "roughnessMap", "metalnessMap", "aoMap", "emissiveMap"].forEach((k) => {
          if (m[k]) texs.add(m[k]);
        });
      });
    }
  });
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  return {
    meshes, vertices, triangles: Math.floor(triangles),
    materials: mats.size, textures: texs.size,
    bbox: { x: +size.x.toFixed(3), y: +size.y.toFixed(3), z: +size.z.toFixed(3) },
    perMesh,
  };
}
