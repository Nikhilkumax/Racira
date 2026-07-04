"use client"

import { useState, useMemo } from "react"
import { ChevronDown, Mic, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  PiperVoice,
  getVoicesByLanguage 
} from "@/domains/voice/lib/piperVoices"

interface VoiceSelectorProps {
  language: string
  selectedVoiceId: string | null
  onChange: (voiceId: string) => void
}

export function VoiceSelector({
  language,
  selectedVoiceId,
  onChange,
}: VoiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const voices = useMemo(() => {
    return getVoicesByLanguage(language)
  }, [language])

  const selectedVoice = voices.find(v => v.id === selectedVoiceId) 
    ?? voices[0]

  if (voices.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-border bg-muted/50">
        <p className="text-sm text-muted-foreground">
          No voices available for this language
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between
          px-4 py-3 rounded-xl border border-border
          bg-card hover:bg-accent/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            selectedVoice?.gender === "male"
              ? "bg-blue-100 dark:bg-blue-900/20"
              : "bg-pink-100 dark:bg-pink-900/20"
          )}>
            <Mic className={cn(
              "w-5 h-5",
              selectedVoice?.gender === "male"
                ? "text-blue-600 dark:text-blue-400"
                : "text-pink-600 dark:text-pink-400"
            )} />
          </div>
          <div className="text-left">
            <div className="font-medium">
              {selectedVoice?.name ?? "Select voice"}
            </div>
            <div className="text-xs text-muted-foreground capitalize">
              {selectedVoice?.gender} · {selectedVoice?.category}
            </div>
          </div>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-2 w-full rounded-xl
            border border-border bg-popover shadow-xl
            max-h-[400px] overflow-y-auto p-2">
            
            <div className="px-3 py-2 text-[11px] font-bold 
              text-muted-foreground/60 tracking-widest uppercase">
              Available Voices
            </div>
            
            {voices.map(voice => (
              <VoiceOption
                key={voice.id}
                voice={voice}
                isSelected={voice.id === selectedVoiceId}
                onClick={() => {
                  onChange(voice.id)
                  setIsOpen(false)
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function VoiceOption({
  voice,
  isSelected,
  onClick,
}: {
  voice: PiperVoice
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-2.5 rounded-lg text-left transition-all duration-200 mb-1",
        "hover:bg-accent/10",
        isSelected ? "bg-brand/10 border-l-2 border-brand" : "border-l-2 border-transparent"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          voice.gender === "male"
            ? "bg-blue-100 dark:bg-blue-900/20"
            : "bg-pink-100 dark:bg-pink-900/20"
        )}>
          <Mic className={cn(
            "w-4 h-4",
            voice.gender === "male"
              ? "text-blue-600 dark:text-blue-400"
              : "text-pink-600 dark:text-pink-400"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm flex items-center gap-2">
            {voice.name}
            {voice.quality === "high" && (
              <Sparkles className="w-3 h-3 text-brand" />
            )}
          </div>
          <div className="text-[11px] text-muted-foreground capitalize flex items-center gap-1.5">
            {voice.gender} · {voice.category}
            <span className="opacity-30">•</span>
            <span>{voice.sizeMB}MB</span>
          </div>
        </div>
        {isSelected && (
          <div className="w-1.5 h-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(var(--brand-rgb),0.5)]" />
        )}
      </div>
    </button>
  )
}
