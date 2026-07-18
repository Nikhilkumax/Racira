"use client";

import { useEffect, useState } from "react";
import { checkKokoroSupport, GateResult } from "../lib/deviceSupport";
import { AlertTriangle, MonitorX, Globe, Loader2 } from "lucide-react";

export function DeviceGate({ children }: { children: React.ReactNode }) {
  const [gateResult, setGateResult] = useState<GateResult | null>(null);

  useEffect(() => {
    checkKokoroSupport().then(setGateResult);
  }, []);

  // Show a loading skeleton that matches StudioCard's size while checking
  if (!gateResult) {
    return (
      <div className="mx-auto w-full max-w-7xl h-[600px] animate-pulse rounded-3xl bg-muted/20 border border-border-subtle flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground font-medium">Checking device capabilities...</p>
      </div>
    );
  }

  if (!gateResult.supported) {
    return <UpgradeScreen reason={gateResult.reason} detail={gateResult.detail} />;
  }

  return <>{children}</>;
}

function UpgradeScreen({ reason, detail }: { reason: string; detail?: string }) {
  let title = "Update Required";
  let message = "Your device or browser doesn't support the required features for our Voice engine.";
  let Icon = AlertTriangle;

  // Tailored messaging based on the gate failure reason
  if (reason === 'no-webgpu-api') {
    title = "Browser Update Required";
    message = "Your browser does not support WebGPU, which is required to run our advanced AI voice engine directly on your device. Please update to a recent version of Chrome, Edge, Safari, or Firefox.";
    Icon = Globe;
  } else if (reason === 'no-gpu-adapter') {
    title = "Hardware Unsupported";
    message = "Your device's graphics hardware doesn't meet the requirements for our advanced Voice engine. This is a hardware limitation rather than a browser issue.";
    Icon = MonitorX;
  } else if (reason === 'webgpu-error') {
    title = "Graphics Initialization Error";
    message = `We encountered an error while initializing graphics support: ${detail}`;
    Icon = AlertTriangle;
  }

  return (
    <div className="mx-auto w-full max-w-3xl py-16 px-6 sm:px-12 text-center border border-border-subtle rounded-3xl bg-gradient-card shadow-elevated">
      <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-destructive" />
      </div>
      
      <h2 className="text-2xl sm:text-3xl font-bold mb-4">{title}</h2>
      <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
        {message}
      </p>
      
      {reason === 'no-webgpu-api' && (
        <div className="text-sm text-muted-foreground text-left bg-muted/30 p-6 rounded-2xl border border-border-subtle">
          <p className="font-semibold text-foreground mb-3 text-base">Supported Browsers</p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li><span className="font-medium text-foreground">Chrome / Edge:</span> Version 113+</li>
            <li><span className="font-medium text-foreground">Safari:</span> Version 26+</li>
            <li><span className="font-medium text-foreground">Firefox:</span> Version 141+ (Windows), Version 145+ (macOS)</li>
          </ul>
          <div className="mt-4 pt-4 border-t border-border-subtle flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs">
              <strong className="font-medium text-foreground">Note:</strong> Firefox on Linux and Android are not yet supported for WebGPU.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
