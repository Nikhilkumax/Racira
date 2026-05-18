"use client"

const DB_NAME = "racira-tts-voices"
const DB_VERSION = 1
const STORE_NAME = "models"

export async function getCachedModel(
  voiceId: string
): Promise<ArrayBuffer | null> {
  return new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      const tx = db.transaction(STORE_NAME, "readonly")
      const store = tx.objectStore(STORE_NAME)
      const get = store.get(voiceId)
      get.onsuccess = () => resolve(get.result ?? null)
      get.onerror = () => resolve(null)
    }
    req.onerror = () => resolve(null)
  })
}

export async function cacheModel(
  voiceId: string,
  data: ArrayBuffer
): Promise<void> {
  return new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onsuccess = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      const tx = db.transaction(STORE_NAME, "readwrite")
      const store = tx.objectStore(STORE_NAME)
      store.put(data, voiceId)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
    }
    req.onerror = () => resolve()
  })
}

export async function downloadAndCacheModel(
  voiceId: string,
  modelUrl: string,
  onProgress?: (percent: number) => void
): Promise<ArrayBuffer> {
  // Check cache first
  const cached = await getCachedModel(voiceId)
  if (cached) return cached

  // Download with progress
  const response = await fetch(modelUrl)
  const total = Number(response.headers.get("content-length") ?? 0)
  
  if (!response.body) throw new Error("Response body is null")
    
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let received = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.length
    if (total > 0) {
      onProgress?.(Math.round((received / total) * 100))
    }
  }

  const buffer = new Uint8Array(
    chunks.reduce((acc, c) => acc + c.length, 0)
  )
  let offset = 0
  for (const chunk of chunks) {
    buffer.set(chunk, offset)
    offset += chunk.length
  }

  const arrayBuffer = buffer.buffer
  await cacheModel(voiceId, arrayBuffer)
  return arrayBuffer
}
