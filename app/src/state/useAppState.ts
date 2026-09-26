import { useEffect, useRef, useState } from 'react'
import {
  AVATAR_BUTTON,
  AVATAR_BUTTON_TEXT,
  AVATAR_TINTS,
  COIN_BUMP_MS,
  SAMPLE_LISTS,
  type AvatarKey,
} from '../data/constants'
import { TTS_LOCALE, type UiLang } from '../data/i18n'

const SETTINGS_KEY = 'poppins_settings_v1'
const GREETING_DURATION_MS = 2000
const GREETING_FADE_MS = 180

interface PersistedSettings {
  avatar: AvatarKey
  coins: number
  uiLang: UiLang
}

function loadSettings(): Partial<PersistedSettings> {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export type Screen = 'home' | 'practiceSetup' | 'lists' | 'paste' | 'settings'

function speak(text: string, lang: string) {
  try {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    window.speechSynthesis.speak(utterance)
  } catch {
    // speech synthesis is a nice-to-have, never worth surfacing an error for
  }
}

export function useAppState() {
  const [screen, setScreen] = useState<Screen>('home')
  const [avatar, setAvatar] = useState<AvatarKey>(() => loadSettings().avatar ?? 'cat')
  const [coins, setCoins] = useState(() => loadSettings().coins ?? 0)
  const [uiLang] = useState<UiLang>(() => loadSettings().uiLang ?? 'sv')
  const [coinBump, setCoinBump] = useState(false)
  const [lists] = useState(SAMPLE_LISTS)
  const [activeListId] = useState(SAMPLE_LISTS[0]?.id ?? null)
  const [showGreeting, setShowGreeting] = useState(false)
  const [greetingHiding, setGreetingHiding] = useState(false)

  const greetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const greetHideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const settings: PersistedSettings = { avatar, coins, uiLang }
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch {
      // localStorage can throw (private browsing, quota) — losing settings
      // persistence isn't worth surfacing an error for
    }
  }, [avatar, coins, uiLang])

  useEffect(() => {
    const root = document.documentElement.style
    root.setProperty('--bg', AVATAR_TINTS[avatar])
    root.setProperty('--accent', AVATAR_BUTTON[avatar])
    root.setProperty('--accent-text', AVATAR_BUTTON_TEXT[avatar] || 'var(--ink)')
  }, [avatar])

  const activeList = lists.find((l) => l.id === activeListId) ?? null

  function navigate(next: Screen) {
    setScreen(next)
  }

  function addCoins(amount: number) {
    setCoins((c) => c + amount)
    setCoinBump(true)
    setTimeout(() => setCoinBump(false), COIN_BUMP_MS)
  }

  function greetMascot(greeting: string) {
    clearTimeout(greetTimer.current)
    clearTimeout(greetHideTimer.current)
    setShowGreeting(true)
    setGreetingHiding(false)
    speak(greeting, TTS_LOCALE[uiLang] ?? TTS_LOCALE.en)
    greetTimer.current = setTimeout(() => {
      setGreetingHiding(true)
      greetHideTimer.current = setTimeout(() => {
        setShowGreeting(false)
        setGreetingHiding(false)
      }, GREETING_FADE_MS)
    }, GREETING_DURATION_MS)
  }

  return {
    screen,
    navigate,
    avatar,
    setAvatar,
    coins,
    addCoins,
    coinBump,
    uiLang,
    lists,
    activeList,
    showGreeting,
    greetingHiding,
    greetMascot,
  }
}
