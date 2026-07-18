export type GateResult =
  | { supported: true }
  | { 
      supported: false; 
      reason: 'no-webgpu-api' | 'no-gpu-adapter' | 'webgpu-error'; 
      detail?: string 
    };

export async function checkKokoroSupport(): Promise<GateResult> {
  if (!('gpu' in navigator)) {
    return { supported: false, reason: 'no-webgpu-api' };
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      return { supported: false, reason: 'no-gpu-adapter' };
    }
    
    return { supported: true };
  } catch (e) {
    return { 
      supported: false, 
      reason: 'webgpu-error', 
      detail: e instanceof Error ? e.message : String(e) 
    };
  }
}
