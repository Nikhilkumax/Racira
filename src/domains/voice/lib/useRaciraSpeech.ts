"use client"

import { useState, useRef, useCallback } from "react"
import { piperGenerate } from "./piperEngine"
import { PIPER_VOICES, getDefaultVoice } from "./piperVoices"

export type SpeechStatus =
  | "idle"
  | "loading"
  | "downloading"
  | "playing"
  | "paused"
  | "done"
  | "error"

export interface UseRaciraSpeechReturn {
  status: SpeechStatus
  loadingMessage: string
  downloadProgress: number
  audioUrl: string | null
  generate: (params: GenerateParams) => Promise<void>
  play: () => void
  pause: () => void
  stop: () => void
  seek: (fraction: number) => void
  currentTime: number
  duration: number
}

export interface GenerateParams {
  text: string
  language: string
  voiceId: string
  speed: number
}

export function useRaciraSpeech(): UseRaciraSpeechReturn {
  const [status, setStatus] = useState<SpeechStatus>("idle")
  const [loadingMessage, setLoadingMessage] = useState("")
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const generate = useCallback(async (
    params: GenerateParams
  ) => {
    setStatus("loading")
    setLoadingMessage("Preparing voice...")
    setDownloadProgress(0)

    try {
      const voice = PIPER_VOICES.find(
        v => v.id === params.voiceId
      ) ?? getDefaultVoice(params.language)

      const blob = await piperGenerate({
        text: params.text,
        voice,
        speed: params.speed,
        onProgress: (msg) => {
          setLoadingMessage(msg)
          if (msg.includes("Downloading")) {
            setStatus("downloading")
            // Extract progress percentage if available
            const match = msg.match(/\((\d+)%\)/)
            if (match) {
              setDownloadProgress(parseInt(match[1]))
            }
          } else {
            setStatus("loading")
          }
        },
      })

      const url = URL.createObjectURL(blob)
      setAudioUrl(url)

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }

      const audio = new Audio(url)
      audioRef.current = audio

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration)
      })
      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime)
      })
      audio.addEventListener("ended", () => {
        setStatus("done")
      })

      setStatus("playing")
      setLoadingMessage("")
      await audio.play()

    } catch (err) {
      setStatus("error")
      setLoadingMessage("")
      console.error("Piper generation failed:", err)
    }
  }, [])

  const play = useCallback(() => {
    if (audioRef.current && (status === "paused" || status === "done")) {
      audioRef.current.play()
      setStatus("playing")
    }
  }, [status])

  const pause = useCallback(() => {
    if (audioRef.current && status === "playing") {
      audioRef.current.pause()
      setStatus("paused")
    }
  }, [status])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setStatus("done")
    setCurrentTime(0)
  }, [])

  const seek = useCallback((fraction: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 
        fraction * (audioRef.current.duration ?? 0)
    }
  }, [])

  return {
    status,
    loadingMessage,
    downloadProgress,
    audioUrl,
    generate,
    play,
    pause,
    stop,
    seek,
    currentTime,
    duration,
  }
}
