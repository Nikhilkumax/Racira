"use client"

import { useState } from "react"
import { ChevronDown, Mic } from "lucide-react"
import { cn } from "@/lib/utils"
import { curatedVoices, type CuratedVoice } from "@/utils/curated-voices"

interface CuratedVoiceSelectorProps {
  selectedVoiceId: string
  onChange: (voiceId: string) => void
}

function VoiceOption({
  voice,
  isSelected,
  onClick,
}: {
  voice: CuratedVoice
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-3 rounded-lg",
        "text-left text-sm transition-colors",
        isSelected
          ? "bg-brand/10 text-brand font-medium"
          : "hover:bg-accent/50 text-foreground"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          voice.gender === "male"
            ? "bg-blue-100 dark:bg-blue-900/20"
            : voice.gender === "female"
              ? "bg-pink-100 dark:bg-pink-900/20"
              : "bg-purple-100 dark:bg-purple-900/20"
        )}
      >
        <Mic
          className={cn(
            "w-4 h-4",
            voice.gender === "male"
              ? "text-blue-600 dark:text-blue-400"
              : voice.gender === "female"
                ? "text-pink-600 dark:text-pink-400"
                : "text-purple-600 dark:text-purple-400"
          )}
        />
      </div>
      <div className="flex-1">
        <div className="font-medium">{voice.displayName}</div>
        <div className="text-xs text-muted-foreground capitalize">
          {voice.personality}
        </div>
      </div>
      {isSelected && (
        <div className="w-2 h-2 rounded-full bg-brand" />
      )}
    </button>
  )
}

export function CuratedVoiceSelector({
  selectedVoiceId,
  onChange,
}: CuratedVoiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedVoice = curatedVoices.find((v) => v.displayName === selectedVoiceId) ?? curatedVoices[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between
          px-4 py-3 rounded-xl border border-border
          bg-card hover:bg-accent/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              selectedVoice.gender === "male"
                ? "bg-blue-100 dark:bg-blue-900/20"
                : selectedVoice.gender === "female"
                  ? "bg-pink-100 dark:bg-pink-900/20"
                  : "bg-purple-100 dark:bg-purple-900/20"
            )}
          >
            <Mic
              className={cn(
                "w-5 h-5",
                selectedVoice.gender === "male"
                  ? "text-blue-600 dark:text-blue-400"
                  : selectedVoice.gender === "female"
                    ? "text-pink-600 dark:text-pink-400"
                    : "text-purple-600 dark:text-purple-400"
              )}
            />
          </div>
          <div className="text-left">
            <div className="font-medium">{selectedVoice.displayName}</div>
            <div className="text-xs text-muted-foreground capitalize">
              {selectedVoice.personality}
            </div>
          </div>
        </div>
        <ChevronDown
          className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute z-50 mt-2 w-full rounded-xl
            border border-border bg-popover shadow-xl
            max-h-[400px] overflow-y-auto p-2"
          >
            <div
              className="px-3 py-2 text-[11px] font-bold 
              text-muted-foreground/60 tracking-widest uppercase"
            >
              Curated Voices
            </div>

            {curatedVoices.map((voice) => (
              <VoiceOption
                key={voice.displayName}
                voice={voice}
                isSelected={voice.displayName === selectedVoiceId}
                onClick={() => {
                  onChange(voice.displayName)
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
