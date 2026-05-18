'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { curatedVoices, type CuratedVoice } from '@/utils/curated-voices'

export interface TonePreset {
  name: string
  pitch: number
}

export const tonePresets: Record<string, number> = {
  'Voiceover': 1.0,        // Normal pitch
  'Podcast Host': 0.95,    // Slightly lower, conversational
  'Narrate a story': 1.05, // Slightly higher, engaging
  'News Anchor': 0.9,      // Lower, authoritative
  'Meditation Guide': 0.85,// Lower, calm
  'Customer Support': 1.0, // Normal, friendly
  'Kids Story': 1.15,      // Higher, playful
  'None': 1.0,             // Default
}

export function usePiperTTS() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  
  const [selectedVoice, setSelectedVoice] = useState<CuratedVoice>(curatedVoices[0])
  const [speed, setSpeed] = useState(1.0)
  const [selectedTone, setSelectedTone] = useState('None')
  
  const [hasGenerated, setHasGenerated] = useState(false)
  const [voiceChanged, setVoiceChanged] = useState(false)
  const [lastVoiceId, setLastVoiceId] = useState<string | null>(null)
  
  const workerRef = useRef<Worker | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize worker
  useEffect(() => {
    try {
      const worker = new Worker(
        new URL('../workers/tts-worker.js', import.meta.url),
        { type: 'module' }
      )
      
      workerRef.current = worker

      worker.onmessage = (e) => {
        if (e.data.type === 'audio') {
          // Audio blob ready
          if (e.data.audio) {
            const url = URL.createObjectURL(e.data.audio)
            setAudioUrl(url)
          }
        }
        
        if (e.data.type === 'done') {
          setIsGenerating(false)
        }
        
        if (e.data.type === 'error') {
          setError(e.data.error)
          setIsGenerating(false)
        }
        
        if (e.data.type === 'progress') {
          setProgress(e.data.progress)
        }
      }

      worker.onerror = (err) => {
        console.error('Worker error:', err)
        setError('Worker error: ' + err.message)
        setIsGenerating(false)
      }

      return () => {
        worker.terminate()
      }
    } catch (err) {
      console.error('Failed to initialize worker:', err)
      setError('Failed to initialize TTS worker')
    }
  }, [])

  // Track voice changes for regenerate button
  useEffect(() => {
    if (hasGenerated && selectedVoice.displayName !== lastVoiceId) {
      setVoiceChanged(true)
    }
  }, [selectedVoice, hasGenerated, lastVoiceId])

  const generate = useCallback(async (text: string) => {
    if (!text.trim() || !selectedVoice || isGenerating) return

    // Clear old audio
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setError(null)
    setProgress(0)
    setIsGenerating(true)
    setHasGenerated(true)
    setVoiceChanged(false)
    setLastVoiceId(selectedVoice.displayName)

    // Get pitch from tone preset
    const pitch = tonePresets[selectedTone] || 1.0

    if (!workerRef.current) {
      setError('TTS worker not initialized')
      setIsGenerating(false)
      return
    }

    workerRef.current.postMessage({
      type: 'generate',
      text: text.trim(),
      voiceId: selectedVoice.originalKey,
      speakerId: selectedVoice.speakerId,
      speed: speed,
      pitch: pitch,
    })
  }, [selectedVoice, speed, selectedTone, isGenerating, audioUrl])

  const download = useCallback(() => {
    if (!audioUrl) return

    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `racira-tts-${selectedVoice.displayName}-${Date.now()}.wav`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [audioUrl, selectedVoice])

  return {
    // State
    isLoading,
    isGenerating,
    progress,
    error,
    audioUrl,
    
    // Voice
    voices: curatedVoices,
    selectedVoice,
    setSelectedVoice,
    
    // Controls
    speed,
    setSpeed,
    selectedTone,
    setSelectedTone,
    
    // Actions
    generate,
    download,
    
    // Button state
    hasGenerated,
    voiceChanged,
    
    // Tone presets
    tonePresets: Object.keys(tonePresets),
  }
}
