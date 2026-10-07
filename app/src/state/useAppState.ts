import { useEffect, useRef, useState } from 'react'
import {
  APP_URL,
  AVATAR_BUTTON,
  AVATAR_BUTTON_TEXT,
  AVATAR_TINTS,
  COIN_BUMP_MS,
  COIN_REWARD,
  SAMPLE_LISTS,
  langHelpers,
  type AvatarKey,
  type Word,
  type WordList,
} from '../data/constants'
import { t, wordsCountText, TTS_LOCALE, type UiLang } from '../data/i18n'
import { COIN_FLIGHT_MS, type CoinFlightData } from '../components/CoinFlight'
import type { ScreenFxKind } from '../components/ScreenFx'
import type { QuizFeedback } from '../components/FeedbackBurst'
import { clearSession, initAuth, sendMagicLink, signOutRemote, type CurrentUser } from '../lib/auth'
import { expandWithForms, mergeForms, wordsHaveAnyForms } from '../lib/adjectiveForms'
import {
  guessPairFromText,
  looksLikeSingleWords,
  parsePasteText,
  type LangPair,
} from '../lib/pasteParsing'
import { shuffle } from '../lib/shuffle'
import { nudgeThemeColor } from '../lib/nudgeThemeColor'
import { getSet, saveSet } from '../lib/sets'
import { playCorrectSound, playWrongSound } from '../lib/sound'
import { fetchAdjectiveForms, translateWords } from '../lib/translate'

const NEW_LIST_COLORS = ['rose', 'butter', 'sky', 'mint'] as const

const SETTINGS_KEY = 'poppins_settings_v1'
const GREETING_DURATION_MS = 2000
const GREETING_FADE_MS = 180
const SCREEN_FX_DURATION_MS = 1900
const ANIM_CORRECT = ['kiss', 'tada', 'bigbounce', 'cartwheel']
const ANIM_WRONG = ['shake', 'sink', 'headtilt', 'spin']
const SCREEN_FX_KINDS: ScreenFxKind[] = ['confetti', 'hearts', 'fireworks', 'curls', 'flowers']

interface PersistedSettings {
  avatar: AvatarKey
  coins: number
  uiLang: UiLang
  soundOn: boolean
  pronunciationOn: boolean
  equippedAccessoryId: string | null
  lists: WordList[]
  activeListId: string | null
}

function loadSettings(): Partial<PersistedSettings> {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export type Screen =
  | 'home'
  | 'practiceSetup'
  | 'quiz'
  | 'done'
  | 'lists'
  | 'paste'
  | 'settings'
  | 'login'
  | 'dressingRoom'

// Safari only re-evaluates its own chrome color (status bar, bottom bar)
// on a fresh page load, never live from a mid-session style change — so
// selectAvatar() below reloads the page to get it right. A plain reload
// would land back on the hardcoded initial screen ('home'), yanking you
// out of Settings; stashing the screen you were on and reading it back
// on the very next load instead keeps the reload from feeling like a
// full reset. sessionStorage (not the persisted settings key) because
// this is a one-shot handoff across that single reload, not state that
// should ever outlive it — read once, then removed.
const PENDING_SCREEN_KEY = 'poppins_pending_screen'

function takePendingScreen(): Screen | null {
  try {
    const value = sessionStorage.getItem(PENDING_SCREEN_KEY)
    sessionStorage.removeItem(PENDING_SCREEN_KEY)
    return value as Screen | null
  } catch {
    return null
  }
}
export interface QuizResult {
  right: number
  wrong: number
  total: number
}

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
  const [screen, setScreen] = useState<Screen>(() => takePendingScreen() ?? 'home')
  // True for the brief window between picking a new avatar and the
  // reload that actually applies it everywhere (see selectAvatar()) —
  // shown as a full-screen transition so that reload reads as a
  // deliberate "updating your look" moment instead of the app freezing.
  const [avatarChanging, setAvatarChanging] = useState(false)
  const [avatar, setAvatar] = useState<AvatarKey>(() => loadSettings().avatar ?? 'cat')
  const [coins, setCoins] = useState(() => loadSettings().coins ?? 0)
  const [uiLang, setUiLang] = useState<UiLang>(() => loadSettings().uiLang ?? 'sv')
  const [coinBump, setCoinBump] = useState(false)
  const [lists, setLists] = useState<WordList[]>(() => loadSettings().lists ?? SAMPLE_LISTS)
  const [activeListId, setActiveListId] = useState<string | null>(
    () =>
      loadSettings().activeListId ?? loadSettings().lists?.[0]?.id ?? SAMPLE_LISTS[0]?.id ?? null,
  )
  const [showGreeting, setShowGreeting] = useState(false)
  const [greetingHiding, setGreetingHiding] = useState(false)

  // ── Dialog ──
  // Replaces window.alert()/window.confirm() — those render as unstyled
  // native browser chrome, breaking out of the app's look. One piece of
  // state drives a single themed overlay (see components/Dialog.tsx),
  // raised via showAlert()/showConfirm() from anywhere below instead of
  // each call site reaching for the native API directly.
  const [dialog, setDialog] = useState<{
    message: string
    confirmLabel: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel?: () => void
  } | null>(null)

  function showAlert(message: string) {
    setDialog({ message, confirmLabel: t(uiLang, 'ok'), onConfirm: () => setDialog(null) })
  }

  function showConfirm(message: string, confirmLabel: string, onYes: () => void) {
    setDialog({
      message,
      confirmLabel,
      cancelLabel: t(uiLang, 'cancel'),
      onConfirm: () => {
        setDialog(null)
        onYes()
      },
      onCancel: () => setDialog(null),
    })
  }

  // ── Paste / edit list ──
  const [pasteName, setPasteName] = useState('')
  const [pasteText, setPasteTextState] = useState('')
  const [pasteParsed, setPasteParsed] = useState<Word[]>([])
  const [pasteStep, setPasteStep] = useState<'paste' | 'review'>('paste')
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [pastePair, setPastePair] = useState<LangPair>({ from: 'sv', to: 'en' })
  const [pasteAutoGuessed, setPasteAutoGuessed] = useState(false)
  const [pasteAutoTranslated, setPasteAutoTranslated] = useState(false)
  const [pasteLoading, setPasteLoading] = useState(false)
  // When on, parsing/translating fetches comparative & superlative forms
  // for any adjectives and stores them alongside each word.
  const [pasteIncludeForms, setPasteIncludeForms] = useState(false)

  const [soundOn, setSoundOn] = useState(() => loadSettings().soundOn ?? false)
  const [pronunciationOn, setPronunciationOn] = useState(
    () => loadSettings().pronunciationOn ?? false,
  )

  // ── Dressing room ──
  // All ACCESSORIES are free starter items for now (step 2 of the
  // coins → dressing room plan: prove the equip/render loop). A priced
  // shop with real ownership tracking is a later step.
  const [equippedAccessoryId, setEquippedAccessoryId] = useState<string | null>(
    () => loadSettings().equippedAccessoryId ?? null,
  )

  // ── Auth / Login ──
  // Signing in is real (a magic-link email through Supabase, the same
  // project the legacy app uses). Lists aren't auto-synced to the server
  // on login — every screen still reads/writes the local `lists` state
  // as the source of truth — but transferLists() below lets a signed-in
  // user push their local lists up explicitly (see Settings).
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginSent, setLoginSent] = useState(false)
  const [loginErr, setLoginErr] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [transferring, setTransferring] = useState(false)

  useEffect(() => {
    initAuth().then((result) => {
      if (result) {
        setCurrentUser(result.user)
        setSessionToken(result.token)
      }
    })
  }, [])

  // Picks up a ?set=<id> link (from shareList() below, opened on another
  // device or by someone else entirely) once on app start. The param is
  // stripped immediately regardless of how the prompt below is answered,
  // so it's never re-offered on a later reload.
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const sharedId = params.get('set')
    if (!sharedId) return
    const url = new URL(location.href)
    url.searchParams.delete('set')
    try {
      history.replaceState(null, '', url.pathname + url.search + url.hash)
    } catch {
      // ignore — worst case the param lingers in the address bar
    }

    getSet(sharedId)
      .then((set) => {
        showConfirm(
          t(uiLang, 'importSharedListConfirm', {
            name: set.topic,
            words: wordsCountText(uiLang, set.vocab.length),
          }),
          t(uiLang, 'add'),
          () => {
            const newList: WordList = {
              id: 'shared-' + set.id,
              name: set.topic,
              color: NEW_LIST_COLORS[Math.floor(Math.random() * NEW_LIST_COLORS.length)],
              words: set.vocab,
              from: set.lang_from,
              to: set.lang_to,
              remoteId: set.id,
            }
            setLists((ls) => (ls.some((l) => l.remoteId === set.id) ? ls : [...ls, newList]))
            setActiveListId(newList.id)
            navigate('home')
          },
        )
      })
      .catch((e) => {
        const reason = e instanceof Error ? e.message : 'unknown error'
        showAlert(t(uiLang, 'couldNotLoadSharedList', { reason }))
      })
    // Only ever meant to handle the link the app was opened with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Quiz ──
  const [quizReversed, setQuizReversed] = useState(false)
  const [quizIncludeForms, setQuizIncludeForms] = useState(false)
  const [quizWords, setQuizWords] = useState<Word[]>([])
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizRight, setQuizRight] = useState(0)
  const [quizWrong, setQuizWrong] = useState(0)
  const [quizAnswer, setQuizAnswer] = useState('')
  const [quizFeedback, setQuizFeedback] = useState<QuizFeedback>(null)
  const [quizAnim, setQuizAnim] = useState<string | null>(null)
  const [quizWriteMode, setQuizWriteMode] = useState(false)
  const [quizReps, setQuizReps] = useState<string[]>([])
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [screenFx, setScreenFx] = useState<{ kind: ScreenFxKind; id: number } | null>(null)
  const [coinFlights, setCoinFlights] = useState<CoinFlightData[]>([])

  const greetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const greetHideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const screenFxTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const coinFlightSeq = useRef(0)
  const screenFxSeq = useRef(0)

  // Quiz state read by callbacks that fire after a delay (the 1800ms
  // "show feedback, then advance" pause, the 300ms pronunciation delay):
  // a closure captured when that timeout was scheduled would read
  // whatever quizRight/quizWrong were BEFORE this same submit's own
  // setState calls applied, since it's the same render's closure. This
  // ref is synced after every render commits, so by the time a delayed
  // callback runs, .current always reflects the latest committed state.
  const latestQuiz = useRef({ quizIdx, quizRight, quizWrong, quizWords, quizReversed })
  useEffect(() => {
    latestQuiz.current = { quizIdx, quizRight, quizWrong, quizWords, quizReversed }
  })

  function saveSettings(settings: PersistedSettings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch {
      // localStorage can throw (private browsing, quota) — losing settings
      // persistence isn't worth surfacing an error for
    }
  }

  useEffect(() => {
    saveSettings({
      avatar,
      coins,
      uiLang,
      soundOn,
      pronunciationOn,
      equippedAccessoryId,
      lists,
      activeListId,
    })
  }, [avatar, coins, uiLang, soundOn, pronunciationOn, equippedAccessoryId, lists, activeListId])

  function selectAvatar(next: AvatarKey) {
    setAvatar(next)
    setAvatarChanging(true)
    // No live update (CSS var, inline style, or theme-color meta) has
    // gotten Safari's own chrome color right without a full page
    // reload — confirmed on a real device (iOS 26.6.2): a fresh load
    // always resolves correctly, switching avatars mid-session never
    // does, however it's set. Persist the new avatar and the current
    // screen immediately (the debounced settings-save effect wouldn't
    // flush in time otherwise) and reload shortly after — long enough
    // to still show the picked avatar's selection state first — landing
    // back on this same screen instead of Home.
    saveSettings({
      avatar: next,
      coins,
      uiLang,
      soundOn,
      pronunciationOn,
      equippedAccessoryId,
      lists,
      activeListId,
    })
    try {
      sessionStorage.setItem(PENDING_SCREEN_KEY, screen)
    } catch {
      // sessionStorage can throw (private browsing, quota) — worst case
      // the reload lands on Home instead of here, not worth surfacing
    }
    setTimeout(() => window.location.reload(), 300)
  }

  useEffect(() => {
    const root = document.documentElement.style
    const tint = AVATAR_TINTS[avatar]
    root.setProperty('--bg', tint)
    root.setProperty('--accent', AVATAR_BUTTON[avatar])
    root.setProperty('--accent-text', AVATAR_BUTTON_TEXT[avatar] || 'var(--ink)')
    // iOS 26 Safari ignores the theme-color meta tag entirely and instead
    // paints its status bar strip from <body>'s own computed
    // background-color — but only reacts live to a direct inline-style
    // write, not to body's "background: var(--bg)" stylesheet rule
    // re-resolving when --bg changes above. This is what actually makes
    // the strip update immediately on that iOS version.
    document.body.style.backgroundColor = tint
    // Older Safari (<=18) and Android Chrome still read the meta tag
    // instead of body's background, so keep it in sync too and nudge so
    // Safari re-evaluates it right away instead of waiting for the next
    // full navigate().
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tint)
    nudgeThemeColor()
  }, [avatar])

  const activeList = lists.find((l) => l.id === activeListId) ?? null

  function navigate(next: Screen) {
    setScreen(next)
    nudgeThemeColor()
  }

  function playScreenFx(kind: ScreenFxKind) {
    const id = screenFxSeq.current++
    setScreenFx({ kind, id })
    clearTimeout(screenFxTimer.current)
    screenFxTimer.current = setTimeout(() => setScreenFx(null), SCREEN_FX_DURATION_MS)
  }

  function clearScreenFx() {
    clearTimeout(screenFxTimer.current)
    setScreenFx(null)
  }

  function spawnCoinFlight(originEl: HTMLElement) {
    const frame = document.getElementById('frame')
    const pouchIcon = document.getElementById('coin-pouch-icon')
    if (!frame || !pouchIcon) return
    const frameRect = frame.getBoundingClientRect()
    const originRect = originEl.getBoundingClientRect()
    const pouchRect = pouchIcon.getBoundingClientRect()
    const ox = originRect.left + originRect.width / 2 - frameRect.left
    const oy = originRect.top + originRect.height / 2 - frameRect.top
    const px = pouchRect.left + pouchRect.width / 2 - frameRect.left
    const py = pouchRect.top + pouchRect.height / 2 - frameRect.top
    const id = coinFlightSeq.current++
    setCoinFlights((flights) => [...flights, { id, ox, oy, dx: px - ox, dy: py - oy }])
    setTimeout(() => {
      setCoinFlights((flights) => flights.filter((f) => f.id !== id))
    }, COIN_FLIGHT_MS + 50)
  }

  function addCoins(amount: number, originEl?: HTMLElement | null) {
    if (originEl) spawnCoinFlight(originEl)
    const delay = originEl ? COIN_FLIGHT_MS : 0
    setTimeout(() => {
      setCoins((c) => c + amount)
      setCoinBump(true)
      setTimeout(() => setCoinBump(false), COIN_BUMP_MS)
    }, delay)
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

  function startQuiz(reversed: boolean, includeForms: boolean) {
    if (!activeList) return
    const pool = includeForms ? expandWithForms(activeList.words, activeList) : activeList.words
    const words = shuffle(pool)
    setQuizReversed(reversed)
    setQuizIncludeForms(includeForms)
    setQuizWords(words)
    setQuizIdx(0)
    setQuizRight(0)
    setQuizWrong(0)
    setQuizAnswer('')
    setQuizFeedback(null)
    setQuizAnim(null)
    setQuizWriteMode(false)
    setQuizReps([])
    navigate('quiz')
    if (pronunciationOn && words[0]) {
      const lh = langHelpers(activeList, reversed)
      speak(lh.src(words[0]), TTS_LOCALE[lh.from] ?? TTS_LOCALE.en)
    }
  }

  function advanceQuiz() {
    const {
      quizIdx: idx,
      quizRight: right,
      quizWrong: wrong,
      quizWords: words,
    } = latestQuiz.current
    if (!activeList) return
    const nextIdx = idx + 1
    if (nextIdx >= words.length) {
      clearScreenFx()
      setResult({ right, wrong, total: words.length })
      navigate('done')
      return
    }
    setQuizIdx(nextIdx)
    setQuizAnswer('')
    setQuizFeedback(null)
    setQuizAnim(null)
    setQuizWriteMode(false)
    setQuizReps([])
    if (pronunciationOn) {
      const lh = langHelpers(activeList, latestQuiz.current.quizReversed)
      const word = words[nextIdx]
      if (word) speak(lh.src(word), TTS_LOCALE[lh.from] ?? TTS_LOCALE.en)
    }
    requestAnimationFrame(() => document.getElementById('quiz-input')?.focus())
  }

  function submitQuizAnswer(inputEl: HTMLElement | null) {
    if (!activeList || quizFeedback) return
    const answer = quizAnswer.trim()
    if (!answer) return
    const lh = langHelpers(activeList, quizReversed)
    const word = quizWords[quizIdx]
    const ok = answer.toLowerCase() === lh.tgt(word).toLowerCase()
    const pool = ok ? ANIM_CORRECT : ANIM_WRONG
    const anim = pool[Math.floor(Math.random() * pool.length)]
    if (ok) {
      if (soundOn) playCorrectSound()
      setQuizRight((r) => r + 1)
      setQuizFeedback('correct')
      setQuizAnim(anim)
      playScreenFx(SCREEN_FX_KINDS[Math.floor(Math.random() * SCREEN_FX_KINDS.length)])
      addCoins(COIN_REWARD, inputEl)
      if (pronunciationOn) {
        setTimeout(() => speak(lh.tgt(word), TTS_LOCALE[lh.to] ?? TTS_LOCALE.en), 300)
      }
      setTimeout(advanceQuiz, 1800)
    } else {
      if (soundOn) playWrongSound()
      setQuizWrong((w) => w + 1)
      setQuizFeedback('wrong')
      setQuizAnim(anim)
      if (pronunciationOn) {
        setTimeout(() => speak(lh.tgt(word), TTS_LOCALE[lh.to] ?? TTS_LOCALE.en), 300)
      }
      setTimeout(() => {
        setQuizWriteMode(true)
        setQuizAnswer('')
      }, 1400)
    }
  }

  // A single input, checked as-you-type (no Enter needed): once it
  // exactly matches the target, it's confirmed into quizReps (rendered as
  // a mascot filling in per repetition) and the input clears for the next
  // one, rather than 5 separate stacked inputs. That keeps exactly one
  // focusable field on screen at all times, at a fixed position, instead
  // of a tall stack where later inputs can sit below the fold and need
  // their own scroll to reach — the source of a whole class of real-device
  // mobile-keyboard bugs the single-input version doesn't have.
  function checkWrite5(val: string) {
    if (!activeList) return
    setQuizAnswer(val)
    const lh = langHelpers(activeList, quizReversed)
    const word = quizWords[quizIdx]
    const target = lh.tgt(word).toLowerCase()
    if (val.trim().toLowerCase() === target) {
      const next = [...quizReps, val]
      setQuizReps(next)
      setQuizAnswer('')
      // Grit gets rewarded the same way a first-try answer does: a coin
      // for each correct repetition, not just one lump sum at the end.
      addCoins(COIN_REWARD, document.getElementById('quiz-input'))
      // Auto-advances once all 5 are done, same as a correct answer in
      // normal mode — no separate "keep going" button to tap once the
      // mascots already show it's finished.
      if (next.length === 5) setTimeout(advanceQuiz, 1800)
    }
  }

  function openExitConfirm() {
    document.getElementById('quiz-input')?.blur()
    setShowExitConfirm(true)
  }
  function closeExitConfirm() {
    setShowExitConfirm(false)
    // Doesn't navigate() (same quiz screen), but the exit dialog's
    // full-bleed dark scrim just disappeared — exactly the moment Safari's
    // chrome color is most likely to be left stale.
    nudgeThemeColor()
  }
  function confirmExit() {
    clearScreenFx()
    setShowExitConfirm(false)
    navigate('home')
  }

  function playAgain() {
    if (activeList) startQuiz(quizReversed, quizIncludeForms)
  }

  function resetLoginState() {
    setLoginEmail('')
    setLoginSent(false)
    setLoginErr('')
  }

  function openLogin() {
    resetLoginState()
    navigate('login')
  }

  function skipLogin() {
    resetLoginState()
    navigate('home')
  }

  async function submitLogin() {
    const email = loginEmail.trim()
    if (!email.includes('@')) {
      setLoginErr('Enter a valid email')
      return
    }
    setLoginErr('')
    setLoginLoading(true)
    try {
      await sendMagicLink(email)
      setLoginSent(true)
      setLoginLoading(false)
    } catch (e) {
      setLoginErr(e instanceof Error ? e.message : 'Could not send link')
      setLoginLoading(false)
    }
  }

  function logout() {
    if (sessionToken) void signOutRemote(sessionToken)
    clearSession()
    setCurrentUser(null)
    setSessionToken(null)
    navigate('home')
  }

  // Uploads every list that hasn't already been saved to the server
  // (tracked via list.remoteId) to the signed-in user's account, so
  // lists built up locally before logging in aren't stranded on this
  // device. Each list is reported separately — one bad list (e.g. over
  // the server's word cap) shouldn't block the rest from transferring.
  async function transferLists() {
    if (!sessionToken) return
    setTransferring(true)
    const failures: string[] = []
    for (const list of lists) {
      if (list.remoteId) continue
      try {
        const { id } = await saveSet(sessionToken, {
          topic: list.name,
          vocab: list.words,
          lang_from: list.from,
          lang_to: list.to,
        })
        setLists((ls) => ls.map((l) => (l.id === list.id ? { ...l, remoteId: id } : l)))
      } catch (e) {
        failures.push(`${list.name}: ${e instanceof Error ? e.message : 'unknown error'}`)
      }
    }
    setTransferring(false)
    if (failures.length) {
      showAlert(`${t(uiLang, 'transferPartialFailure')}\n${failures.join('\n')}`)
    } else {
      showAlert(t(uiLang, 'transferSuccess'))
    }
  }

  // Creates (or reuses) a shareable link for a list and hands it off via
  // the native share sheet, falling back to clipboard copy where that's
  // not available. Works whether or not you're signed in — an anonymous
  // POST /sets just creates an unowned set (see supabase/functions/greta/
  // index.ts's saveSet handler) — so sharing never requires logging in.
  async function shareList(id: string) {
    const list = lists.find((l) => l.id === id)
    if (!list) return
    try {
      let remoteId = list.remoteId
      if (!remoteId) {
        const saved = await saveSet(sessionToken, {
          topic: list.name,
          vocab: list.words,
          lang_from: list.from,
          lang_to: list.to,
        })
        remoteId = saved.id
        setLists((ls) => ls.map((l) => (l.id === id ? { ...l, remoteId } : l)))
      }
      const url = `${APP_URL}?set=${remoteId}`
      if (navigator.share) {
        try {
          await navigator.share({ title: list.name, url })
        } catch (e) {
          if (e instanceof Error && e.name === 'AbortError') return
          throw e
        }
      } else {
        await navigator.clipboard.writeText(url)
        showAlert(t(uiLang, 'shareLinkCopied', { url }))
      }
    } catch (e) {
      const reason = e instanceof Error ? e.message : 'unknown error'
      showAlert(t(uiLang, 'couldNotShare', { reason }))
    }
  }

  function openDressingRoom() {
    navigate('dressingRoom')
  }

  function toggleAccessory(id: string) {
    setEquippedAccessoryId((cur) => (cur === id ? null : id))
  }

  function selectList(id: string) {
    setActiveListId(id)
    navigate('home')
  }

  function deleteListById(id: string) {
    setLists((ls) => ls.filter((l) => l.id !== id))
    setActiveListId((cur) => (cur === id ? null : cur))
  }

  function confirmDeleteList(id: string) {
    showConfirm(t(uiLang, 'deleteListConfirm'), t(uiLang, 'deleteConfirm'), () =>
      deleteListById(id),
    )
  }

  function saveNewList(list: WordList) {
    setLists((ls) => [...ls, list])
    setActiveListId(list.id)
    navigate('home')
  }

  function updateListById(id: string, patch: Partial<WordList>) {
    setLists((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)))
    setActiveListId(id)
    navigate('home')
  }

  function resetPasteState() {
    setPasteName('')
    setPasteTextState('')
    setPasteParsed([])
    setPasteStep('paste')
    setEditingListId(null)
    setPastePair({ from: 'sv', to: 'en' })
    setPasteAutoGuessed(false)
    setPasteAutoTranslated(false)
    setPasteLoading(false)
    setPasteIncludeForms(false)
  }

  function openNewList() {
    resetPasteState()
    navigate('paste')
  }

  function openEditList() {
    if (!activeList) return
    const text = activeList.words
      .map((w) => `${w[activeList.from] ?? w.sv ?? ''} = ${w[activeList.to] ?? w.en ?? ''}`)
      .join('\n')
    setPasteName(activeList.name)
    setPasteTextState(text)
    setPasteParsed([])
    setPasteStep('paste')
    setEditingListId(activeList.id)
    setPastePair({ from: activeList.from || 'sv', to: activeList.to || 'en' })
    setPasteAutoGuessed(true)
    setPasteAutoTranslated(false)
    setPasteLoading(false)
    // Defaults back on if this list already has forms, so re-saving after
    // an unrelated edit (a typo fix, a renamed list) doesn't silently drop
    // them just because the toggle isn't re-checked.
    setPasteIncludeForms(wordsHaveAnyForms(activeList.words))
    navigate('paste')
  }

  function closePaste() {
    navigate(activeListId ? 'home' : 'lists')
  }

  function setPasteText(value: string) {
    setPasteTextState(value)
  }

  // When pasteIncludeForms is on, fetches comparative/superlative forms
  // for `parsed` and merges them in; otherwise returns it unchanged. A
  // forms-fetch failure doesn't lose the underlying translation — it just
  // falls back to saving without conjugations, with a heads-up.
  async function withForms(parsed: Word[], pair: LangPair): Promise<Word[]> {
    if (!pasteIncludeForms) return parsed
    try {
      const forms = await fetchAdjectiveForms(
        parsed.map((w) => ({ from: w[pair.from] ?? '', to: w[pair.to] ?? '' })),
        pair.from,
        pair.to,
      )
      return mergeForms(parsed, forms, pair.from, pair.to)
    } catch (e) {
      const reason = e instanceof Error ? e.message : 'unknown error'
      showAlert(t(uiLang, 'couldNotAddForms', { reason }))
      return parsed
    }
  }

  async function reTranslateReview(pair: LangPair) {
    setPastePair(pair)
    setPasteAutoGuessed(true)
    setPasteLoading(true)
    try {
      const rawWords = pasteText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
      const { translations } = await translateWords(rawWords, pair.from, pair.to)
      const parsed = rawWords.map((w, i) => ({ [pair.from]: w, [pair.to]: translations[i] }))
      setPasteParsed(await withForms(parsed, pair))
      setPasteLoading(false)
    } catch (e) {
      setPasteLoading(false)
      const reason = e instanceof Error ? e.message : 'unknown error'
      showAlert(t(uiLang, 'couldNotTranslate', { reason }))
    }
  }

  // Re-parses a manually-pasted (not auto-translated) list for a new
  // language pair, re-fetching forms for it too when the toggle is on —
  // shared by changePasteFrom/changePasteTo since they only differ in
  // which side of the pair they update.
  function applyManualPair(pair: LangPair) {
    setPastePair(pair)
    setPasteAutoGuessed(true)
    const parsed = parsePasteText(pasteText, pair)
    if (!pasteIncludeForms) {
      setPasteParsed(parsed)
      return
    }
    setPasteLoading(true)
    void withForms(parsed, pair).then((withF) => {
      setPasteParsed(withF)
      setPasteLoading(false)
    })
  }

  function changePasteFrom(code: string) {
    const pair = { ...pastePair, from: code }
    if (pasteAutoTranslated) void reTranslateReview(pair)
    else applyManualPair(pair)
  }

  function changePasteTo(code: string) {
    const pair = { ...pastePair, to: code }
    if (pasteAutoTranslated) void reTranslateReview(pair)
    else applyManualPair(pair)
  }

  async function submitPasteParse() {
    const text = pasteText
    if (looksLikeSingleWords(text)) {
      const rawWords = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
      setPasteLoading(true)
      try {
        const { from, to, translations } = await translateWords(rawWords)
        const pair = { from, to }
        const parsed = rawWords.map((w, i) => ({ [from]: w, [to]: translations[i] }))
        setPasteParsed(await withForms(parsed, pair))
        setPasteStep('review')
        setPastePair(pair)
        setPasteAutoGuessed(true)
        setPasteAutoTranslated(true)
        setPasteLoading(false)
      } catch (e) {
        setPasteLoading(false)
        const reason = e instanceof Error ? e.message : 'unknown error'
        showAlert(t(uiLang, 'couldNotTranslate', { reason }))
      }
      return
    }
    const guess = !pasteAutoGuessed && guessPairFromText(text)
    const pair = guess || pastePair
    const parsed = parsePasteText(text, pair)
    setPasteStep('review')
    setPastePair(pair)
    setPasteAutoGuessed(true)
    setPasteAutoTranslated(false)
    if (!pasteIncludeForms) {
      setPasteParsed(parsed)
      return
    }
    setPasteLoading(true)
    setPasteParsed(await withForms(parsed, pair))
    setPasteLoading(false)
  }

  function backToPasteStep() {
    setPasteStep('paste')
  }

  function savePasteList() {
    if (editingListId) {
      updateListById(editingListId, {
        name: pasteName || 'My new list',
        words: pasteParsed,
        from: pastePair.from,
        to: pastePair.to,
      })
    } else {
      saveNewList({
        id: 'user-' + Date.now(),
        name: pasteName || 'My new list',
        color: NEW_LIST_COLORS[Math.floor(Math.random() * NEW_LIST_COLORS.length)],
        words: pasteParsed,
        from: pastePair.from,
        to: pastePair.to,
      })
    }
  }

  return {
    screen,
    navigate,
    dialog,
    avatar,
    selectAvatar,
    avatarChanging,
    coins,
    addCoins,
    coinBump,
    uiLang,
    setUiLang,
    soundOn,
    setSoundOn,
    pronunciationOn,
    setPronunciationOn,
    equippedAccessoryId,
    openDressingRoom,
    toggleAccessory,
    currentUser,
    loginEmail,
    setLoginEmail,
    loginSent,
    loginErr,
    loginLoading,
    openLogin,
    skipLogin,
    submitLogin,
    logout,
    transferring,
    transferLists,
    pendingTransferCount: lists.filter((l) => !l.remoteId).length,
    lists,
    activeList,
    activeListId,
    selectList,
    confirmDeleteList,
    shareList,
    openNewList,
    openEditList,
    closePaste,
    pasteName,
    setPasteName,
    pasteText,
    setPasteText,
    pasteParsed,
    pasteStep,
    editingListId,
    pastePair,
    pasteLoading,
    pasteIncludeForms,
    setPasteIncludeForms,
    changePasteFrom,
    changePasteTo,
    submitPasteParse,
    backToPasteStep,
    savePasteList,
    showGreeting,
    greetingHiding,
    greetMascot,
    quizReversed,
    startQuiz,
    quizWords,
    quizIdx,
    quizRight,
    quizWrong,
    quizAnswer,
    setQuizAnswer,
    quizFeedback,
    quizAnim,
    quizWriteMode,
    quizReps,
    showExitConfirm,
    result,
    screenFx,
    coinFlights,
    submitQuizAnswer,
    checkWrite5,
    advanceQuiz,
    openExitConfirm,
    closeExitConfirm,
    confirmExit,
    playAgain,
  }
}
