import { useEffect, useRef, useState } from 'react'
import {
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
import { TTS_LOCALE, type UiLang } from '../data/i18n'
import { COIN_FLIGHT_MS, type CoinFlightData } from '../components/CoinFlight'
import type { ScreenFxKind } from '../components/ScreenFx'
import type { QuizFeedback } from '../components/FeedbackBurst'
import { clearSession, initAuth, sendMagicLink, signOutRemote, type CurrentUser } from '../lib/auth'
import {
  guessPairFromText,
  looksLikeSingleWords,
  parsePasteText,
  type LangPair,
} from '../lib/pasteParsing'
import { shuffle } from '../lib/shuffle'
import { playCorrectSound, playWrongSound } from '../lib/sound'
import { translateWords } from '../lib/translate'

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
  'home' | 'practiceSetup' | 'quiz' | 'done' | 'lists' | 'paste' | 'settings' | 'login'
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
  const [screen, setScreen] = useState<Screen>('home')
  const [avatar, setAvatar] = useState<AvatarKey>(() => loadSettings().avatar ?? 'cat')
  const [coins, setCoins] = useState(() => loadSettings().coins ?? 0)
  const [uiLang, setUiLang] = useState<UiLang>(() => loadSettings().uiLang ?? 'sv')
  const [coinBump, setCoinBump] = useState(false)
  const [lists, setLists] = useState(SAMPLE_LISTS)
  const [activeListId, setActiveListId] = useState<string | null>(SAMPLE_LISTS[0]?.id ?? null)
  const [showGreeting, setShowGreeting] = useState(false)
  const [greetingHiding, setGreetingHiding] = useState(false)

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

  const [soundOn, setSoundOn] = useState(() => loadSettings().soundOn ?? false)
  const [pronunciationOn, setPronunciationOn] = useState(
    () => loadSettings().pronunciationOn ?? false,
  )

  // ── Auth / Login ──
  // Signing in is real (a magic-link email through Supabase, the same
  // project the legacy app uses), but nothing here re-syncs lists to
  // the server once signed in — every screen still reads/writes the
  // local `lists` state only. See the Login screen's PR description.
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginSent, setLoginSent] = useState(false)
  const [loginErr, setLoginErr] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  useEffect(() => {
    initAuth().then((result) => {
      if (result) {
        setCurrentUser(result.user)
        setSessionToken(result.token)
      }
    })
  }, [])

  // ── Quiz ──
  const [quizReversed, setQuizReversed] = useState(false)
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

  useEffect(() => {
    const settings: PersistedSettings = { avatar, coins, uiLang, soundOn, pronunciationOn }
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch {
      // localStorage can throw (private browsing, quota) — losing settings
      // persistence isn't worth surfacing an error for
    }
  }, [avatar, coins, uiLang, soundOn, pronunciationOn])

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

  function startQuiz(reversed: boolean) {
    if (!activeList) return
    const words = shuffle(activeList.words)
    setQuizReversed(reversed)
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
  }
  function confirmExit() {
    clearScreenFx()
    setShowExitConfirm(false)
    navigate('home')
  }

  function playAgain() {
    if (activeList) startQuiz(quizReversed)
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

  function selectList(id: string) {
    setActiveListId(id)
    navigate('home')
  }

  function deleteListById(id: string) {
    setLists((ls) => ls.filter((l) => l.id !== id))
    setActiveListId((cur) => (cur === id ? null : cur))
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
    navigate('paste')
  }

  function closePaste() {
    navigate(activeListId ? 'home' : 'lists')
  }

  function setPasteText(value: string) {
    setPasteTextState(value)
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
      setPasteParsed(parsed)
      setPasteLoading(false)
    } catch {
      setPasteLoading(false)
      window.alert('Could not translate — try again.')
    }
  }

  function changePasteFrom(code: string) {
    const pair = { ...pastePair, from: code }
    if (pasteAutoTranslated) {
      void reTranslateReview(pair)
    } else {
      setPastePair(pair)
      setPasteAutoGuessed(true)
      setPasteParsed(parsePasteText(pasteText, pair))
    }
  }

  function changePasteTo(code: string) {
    const pair = { ...pastePair, to: code }
    if (pasteAutoTranslated) {
      void reTranslateReview(pair)
    } else {
      setPastePair(pair)
      setPasteAutoGuessed(true)
      setPasteParsed(parsePasteText(pasteText, pair))
    }
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
        setPasteParsed(parsed)
        setPasteStep('review')
        setPastePair(pair)
        setPasteAutoGuessed(true)
        setPasteAutoTranslated(true)
        setPasteLoading(false)
      } catch {
        setPasteLoading(false)
        window.alert('Could not translate — try again.')
      }
      return
    }
    const guess = !pasteAutoGuessed && guessPairFromText(text)
    const pair = guess || pastePair
    const parsed = parsePasteText(text, pair)
    setPasteParsed(parsed)
    setPasteStep('review')
    setPastePair(pair)
    setPasteAutoGuessed(true)
    setPasteAutoTranslated(false)
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
    avatar,
    setAvatar,
    coins,
    addCoins,
    coinBump,
    uiLang,
    setUiLang,
    soundOn,
    setSoundOn,
    pronunciationOn,
    setPronunciationOn,
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
    lists,
    activeList,
    activeListId,
    selectList,
    deleteListById,
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
