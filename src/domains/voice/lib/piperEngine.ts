"use client"

import { PiperVoice } from "./piperVoices"
import { downloadAndCacheModel } from "./voiceCache"

export interface PiperGenerateParams {
  text: string
  voice: PiperVoice
  speed: number
  onProgress?: (msg: string) => void
}

let worker: Worker | null = null
let workerStatus: "idle" | "loading" | "ready" = "idle"
let currentVoiceId: string | null = null

async function getWorker(
  voice: PiperVoice, 
  onProgress?: (msg: string) => void
): Promise<Worker> {
  if (worker && workerStatus === "ready" && currentVoiceId === voice.id) {
    return worker
  }

  if (worker && currentVoiceId !== voice.id) {
    worker.terminate()
    worker = null
    workerStatus = "idle"
  }

  return new Promise(async (resolve, reject) => {
    try {
      onProgress?.("Downloading voice model...")
      
      // Download model and config in parallel
      const [modelBuffer, configBuffer] = await Promise.all([
        downloadAndCacheModel(voice.id, voice.modelUrl, (p) => {
          onProgress?.(`Downloading voice (${p}%)`)
        }),
        downloadAndCacheModel(`${voice.id}-config`, voice.configUrl)
      ])

      onProgress?.("Initializing voice engine...")
      
      worker = new Worker("/piper/tts-worker.js", { type: "module" })
      workerStatus = "loading"
      currentVoiceId = voice.id

      const handleInit = (e: MessageEvent) => {
        if (e.data.status === "ready") {
          workerStatus = "ready"
          worker?.removeEventListener("message", handleInit)
          resolve(worker!)
        } else if (e.data.status === "error") {
          workerStatus = "idle"
          reject(new Error(e.data.data))
        }
      }

      worker.addEventListener("message", handleInit)
      
      // Pass buffers to worker
      worker.postMessage({
        type: "init",
        modelUrl: modelBuffer,
        configUrl: configBuffer
      }, [modelBuffer, configBuffer])

    } catch (err) {
      reject(err)
    }
  })
}

export async function piperGenerate(
  params: PiperGenerateParams
): Promise<Blob> {
  const { text, voice, speed, onProgress } = params
  
  const activeWorker = await getWorker(voice, onProgress)
  
  onProgress?.("Generating audio...")
  
  return new Promise((resolve, reject) => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.status === "complete") {
        activeWorker.removeEventListener("message", handleMessage)
        if (e.data.audio) {
          resolve(e.data.audio)
        } else {
          reject(new Error("Generation failed: No audio returned"))
        }
      } else if (e.data.status === "error") {
        activeWorker.removeEventListener("message", handleMessage)
        reject(new Error(e.data.data))
      }
    }

    activeWorker.addEventListener("message", handleMessage)
    activeWorker.postMessage({
      text,
      voice: 0, // HF models are usually single speaker
      speed
    })
  })
}
