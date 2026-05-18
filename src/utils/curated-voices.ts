export interface CuratedVoice {
  id: string
  name: string
  originalKey: string
  speakerId: number
  displayName: string
  personality: string
  gender: 'male' | 'female' | 'neutral'
  age: 'young' | 'adult' | 'mature'
}

const rawCuratedVoices = [
  // FEMALE VOICES - Professional
  { originalKey: 'en_US-libritts_r-medium', speakerId: 0, displayName: 'Sarah', personality: 'Professional', gender: 'female', age: 'adult' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 15, displayName: 'Emma', personality: 'Warm', gender: 'female', age: 'adult' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 23, displayName: 'Olivia', personality: 'Confident', gender: 'female', age: 'adult' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 42, displayName: 'Sophia', personality: 'Friendly', gender: 'female', age: 'adult' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 58, displayName: 'Isabella', personality: 'Clear', gender: 'female', age: 'adult' },
  
  // FEMALE VOICES - Energetic
  { originalKey: 'en_US-libritts_r-medium', speakerId: 77, displayName: 'Mia', personality: 'Energetic', gender: 'female', age: 'young' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 91, displayName: 'Charlotte', personality: 'Bright', gender: 'female', age: 'young' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 105, displayName: 'Amelia', personality: 'Cheerful', gender: 'female', age: 'young' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 128, displayName: 'Harper', personality: 'Upbeat', gender: 'female', age: 'young' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 143, displayName: 'Evelyn', personality: 'Lively', gender: 'female', age: 'young' },
  
  // FEMALE VOICES - Calm
  { originalKey: 'en_US-libritts_r-medium', speakerId: 167, displayName: 'Grace', personality: 'Calm', gender: 'female', age: 'mature' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 189, displayName: 'Victoria', personality: 'Soothing', gender: 'female', age: 'mature' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 201, displayName: 'Eleanor', personality: 'Gentle', gender: 'female', age: 'mature' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 224, displayName: 'Lily', personality: 'Soft', gender: 'female', age: 'mature' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 245, displayName: 'Nora', personality: 'Peaceful', gender: 'female', age: 'mature' },
  
  // MALE VOICES - Professional
  { originalKey: 'en_US-libritts_r-medium', speakerId: 267, displayName: 'James', personality: 'Professional', gender: 'male', age: 'adult' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 289, displayName: 'William', personality: 'Authoritative', gender: 'male', age: 'adult' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 312, displayName: 'Oliver', personality: 'Confident', gender: 'male', age: 'adult' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 334, displayName: 'Benjamin', personality: 'Clear', gender: 'male', age: 'adult' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 356, displayName: 'Lucas', personality: 'Strong', gender: 'male', age: 'adult' },
  
  // MALE VOICES - Warm
  { originalKey: 'en_US-libritts_r-medium', speakerId: 378, displayName: 'Henry', personality: 'Warm', gender: 'male', age: 'adult' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 401, displayName: 'Alexander', personality: 'Friendly', gender: 'male', age: 'adult' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 423, displayName: 'Daniel', personality: 'Approachable', gender: 'male', age: 'adult' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 445, displayName: 'Matthew', personality: 'Kind', gender: 'male', age: 'adult' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 467, displayName: 'David', personality: 'Gentle', gender: 'male', age: 'adult' },
  
  // MALE VOICES - Energetic
  { originalKey: 'en_US-libritts_r-medium', speakerId: 489, displayName: 'Michael', personality: 'Energetic', gender: 'male', age: 'young' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 512, displayName: 'Ethan', personality: 'Dynamic', gender: 'male', age: 'young' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 534, displayName: 'Ryan', personality: 'Upbeat', gender: 'male', age: 'young' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 556, displayName: 'Noah', personality: 'Bright', gender: 'male', age: 'young' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 578, displayName: 'Logan', personality: 'Lively', gender: 'male', age: 'young' },
  
  // MALE VOICES - Mature
  { originalKey: 'en_US-libritts_r-medium', speakerId: 601, displayName: 'Thomas', personality: 'Mature', gender: 'male', age: 'mature' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 623, displayName: 'Charles', personality: 'Wise', gender: 'male', age: 'mature' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 645, displayName: 'George', personality: 'Distinguished', gender: 'male', age: 'mature' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 667, displayName: 'Arthur', personality: 'Refined', gender: 'male', age: 'mature' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 689, displayName: 'Edward', personality: 'Dignified', gender: 'male', age: 'mature' },
  
  // NEUTRAL VOICES - Versatile
  { originalKey: 'en_US-libritts_r-medium', speakerId: 712, displayName: 'Jordan', personality: 'Versatile', gender: 'neutral', age: 'adult' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 734, displayName: 'Alex', personality: 'Neutral', gender: 'neutral', age: 'adult' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 756, displayName: 'Taylor', personality: 'Balanced', gender: 'neutral', age: 'adult' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 778, displayName: 'Morgan', personality: 'Smooth', gender: 'neutral', age: 'adult' },
  { originalKey: 'en_US-libritts_r-medium', speakerId: 801, displayName: 'Casey', personality: 'Clear', gender: 'neutral', age: 'adult' },
]

export const curatedVoices: CuratedVoice[] = rawCuratedVoices.map(v => ({
  ...v,
  id: v.speakerId.toString(),
  name: v.displayName,
  gender: v.gender as 'male' | 'female' | 'neutral',
  age: v.age as 'young' | 'adult' | 'mature'
}))
