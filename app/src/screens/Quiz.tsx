import type { KeyboardEvent } from 'react'
import { Button } from '@base-ui/react/button'
import { CoinPouch } from '../components/CoinPouch'
import { FeedbackBurst } from '../components/FeedbackBurst'
import { langHelpers, type Word, type WordList } from '../data/constants'
import { langName, t, type UiLang } from '../data/i18n'
import { animName } from '../lib/animName'
import { useSwipeBack } from '../lib/useSwipeBack'
import { ArrowDown, ArrowUp, Cross } from '../icons/icons'
import { Mascot, type MascotMood } from '../icons/Mascot'

// One mood per write-5x repetition slot, so the 5 filled-in mascots look
// varied rather than identical copies of the same expression.
const WRITE5_MOODS: MascotMood[] = ['happy', 'cheer', 'proud', 'happy', 'cheer']

interface QuizProps {
  list: WordList
  uiLang: UiLang
  coins: number
  coinBump: boolean
  quizWords: Word[]
  quizIdx: number
  quizRight: number
  quizWrong: number
  quizReversed: boolean
  quizAnswer: string
  setQuizAnswer: (val: string) => void
  quizFeedback: 'correct' | 'wrong' | null
  quizAnim: string | null
  quizWriteMode: boolean
  quizReps: string[]
  showExitConfirm: boolean
  onSubmit: (inputEl: HTMLElement | null) => void
  onCheckWrite5: (val: string) => void
  onOpenExitConfirm: () => void
  onCloseExitConfirm: () => void
  onConfirmExit: () => void
}

// Splits a "...{key}..." template on one placeholder and renders the
// matched part as its own element instead of raw string interpolation —
// the legacy app injects a styled <span> into the string via t(); here
// that span is real JSX, not markup pasted into text.
function interpolateNode(template: string, key: string, node: React.ReactNode): React.ReactNode {
  const [before, after] = template.split(`{${key}}`)
  return (
    <>
      {before}
      {node}
      {after}
    </>
  )
}

export function Quiz({
  list,
  uiLang,
  coins,
  coinBump,
  quizWords,
  quizIdx,
  quizRight,
  quizWrong,
  quizReversed,
  quizAnswer,
  setQuizAnswer,
  quizFeedback,
  quizAnim,
  quizWriteMode,
  quizReps,
  showExitConfirm,
  onSubmit,
  onCheckWrite5,
  onOpenExitConfirm,
  onCloseExitConfirm,
  onConfirmExit,
}: QuizProps) {
  useSwipeBack(onOpenExitConfirm)
  const lh = langHelpers(list, quizReversed)
  const word = quizWords[quizIdx]
  const total = quizWords.length
  if (!word) return null

  if (quizWriteMode) {
    const target = lh.tgt(word)
    const done = quizReps.length
    const srcLang = langName(uiLang, lh.from)

    return (
      <div
        style={{
          padding: '16px 24px calc(18px + env(safe-area-inset-bottom))',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          minHeight: '100%',
        }}
      >
        <div
          id="write5-topnav"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            position: 'sticky',
            top: 0,
            zIndex: 5,
            background: 'var(--bg)',
            paddingTop: 16,
            paddingBottom: 8,
            marginTop: -16,
          }}
        >
          <CoinPouch coins={coins} bump={coinBump} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="label-caps">{t(uiLang, 'practice')}</div>
          <h2
            className="h-font"
            style={{
              fontSize: 28,
              color: 'var(--ink)',
              margin: '4px 0 0',
              letterSpacing: '-0.02em',
            }}
          >
            {interpolateNode(
              t(uiLang, 'writeNTimes'),
              'word',
              <span style={{ color: 'var(--pink)' }}>{target}</span>,
            )}
          </h2>
          <p className="b-font" style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 6 }}>
            {t(uiLang, 'inLang', { source: lh.src(word), lang: srcLang })}
          </p>
        </div>
        {/* One Mascot per repetition instead of a growing text list below
            the input (which real-device testing showed wasn't reliably
            visible) — each starts as a faint outline and fills in with a
            different expression the moment its repetition is confirmed
            correct, right where the single "thinking" mascot used to sit. */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          {WRITE5_MOODS.map((mood, i) => (
            <div key={i} data-testid="write5-mascot" data-done={i < done}>
              <Mascot size={44} mood={mood} outline={i >= done} />
            </div>
          ))}
        </div>
        <input
          id="quiz-input"
          className="inp"
          value={quizAnswer}
          placeholder={target}
          onChange={(e) => onCheckWrite5(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') e.preventDefault()
          }}
        />
      </div>
    )
  }

  const fbBg =
    quizFeedback === 'correct'
      ? 'var(--mint-soft)'
      : quizFeedback === 'wrong'
        ? 'var(--pink-soft)'
        : 'var(--paper)'
  const cardAnim =
    quizFeedback === 'correct'
      ? 'greta-card-correct 700ms ease-out'
      : quizFeedback === 'wrong'
        ? 'greta-card-wrong 480ms ease-in-out'
        : 'none'
  const mascotMood: MascotMood =
    quizFeedback === 'correct'
      ? quizAnim === 'tada'
        ? 'proud'
        : 'cheer'
      : quizFeedback === 'wrong'
        ? 'oops'
        : 'happy'

  const isKiss = quizAnim === 'kiss'
  const mascotStyle: React.CSSProperties = isKiss
    ? {
        position: 'absolute',
        bottom: 14,
        right: '50%',
        marginRight: -36,
        transformOrigin: 'center bottom',
        animation: quizFeedback ? 'greta-kiss 1100ms cubic-bezier(.4,1.4,.6,1) both' : 'none',
        zIndex: 3,
      }
    : {
        position: 'absolute',
        bottom: -8,
        right: -8,
        transformOrigin: 'center bottom',
        animation: quizFeedback ? `${animName(quizAnim)} both` : 'none',
        zIndex: 3,
      }

  const inpBg =
    quizFeedback === 'correct'
      ? 'var(--mint-soft)'
      : quizFeedback === 'wrong'
        ? 'var(--pink-soft)'
        : 'var(--paper)'
  const tgtLang = langName(uiLang, lh.to)

  return (
    <div
      style={{
        padding: '16px 24px calc(18px + env(safe-area-inset-bottom))',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        minHeight: '100%',
        position: 'relative',
      }}
    >
      <div
        id="quiz-topnav"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          background: 'var(--bg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          // 36px close button + 24px gap from the content next to it.
          paddingRight: 60,
          paddingTop: 16,
          paddingBottom: 8,
          marginTop: -16,
        }}
      >
        <div className="dotbar">
          {quizWords.map((_, i) => (
            <div
              key={i}
              className={`dot ${i < quizIdx ? 'dot-done' : i === quizIdx ? 'dot-current' : 'dot-future'}`}
            />
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'var(--m-font)',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--ink)',
          }}
        >
          <span>
            {quizIdx + 1} / {total}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <CoinPouch coins={coins} bump={coinBump} />
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <ArrowUp size={20} color="#241F3D" />
              {quizRight}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <ArrowDown size={20} color="#241F3D" />
              {quizWrong}
            </span>
          </span>
        </div>
        <Button
          id="quiz-exit"
          className="icon-btn-plain"
          style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}
          onClick={onOpenExitConfirm}
        >
          <Cross size={20} color="#241F3D" strokeWidth={3} />
        </Button>
      </div>

      <div
        className="card-lg"
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(24px,8cqh,48px) clamp(24px,8vw,48px)',
          background: fbBg,
          transition: 'background 250ms',
          position: 'relative',
          overflow: 'hidden',
          animation: cardAnim,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            alignItems: 'center',
            textAlign: 'center',
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          {!quizFeedback && (
            <div className="quiz-hint">
              <div className="b-font" style={{ fontSize: 14, color: 'var(--ink)', opacity: 0.7 }}>
                {t(uiLang, 'whatMeanIn', { lang: tgtLang })}
              </div>
              <div style={{ height: 1, width: 40, background: 'var(--ink)', opacity: 0.2 }} />
            </div>
          )}
          <div
            className="h-font"
            style={{
              fontSize: 'clamp(30px,9cqh,54px)',
              lineHeight: 0.95,
              color: 'var(--ink)',
              letterSpacing: '-.03em',
              wordBreak: 'break-word',
            }}
          >
            {lh.src(word)}
          </div>
          {quizFeedback === 'wrong' && (
            <div
              className="h-font"
              style={{
                fontSize: 30,
                color: 'var(--wrong)',
                animation: 'greta-answer-rise 360ms ease-out both',
              }}
            >
              = {lh.tgt(word)}
            </div>
          )}
        </div>
        <FeedbackBurst feedback={quizFeedback} anim={quizAnim} />
        <div style={mascotStyle}>
          <Mascot size={86} mood={mascotMood} />
        </div>
      </div>

      <input
        id="quiz-input"
        className="inp"
        value={quizAnswer}
        placeholder={t(uiLang, 'typeInLang')}
        readOnly={!!quizFeedback}
        style={{
          fontSize: 18,
          fontWeight: 600,
          background: inpBg,
          transition: 'background 250ms',
          textAlign: quizFeedback ? 'center' : 'left',
        }}
        onChange={(e) => setQuizAnswer(e.target.value)}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onSubmit(document.getElementById('quiz-input'))
          }
        }}
      />

      {showExitConfirm && (
        <div
          style={{
            // Fixed, not absolute: absolute would size against this
            // screen's own root div, whose height (minHeight:'100%' of
            // #screen) can transiently lag the real keyboard-open/closed
            // state during the brief animation right after tapping the
            // exit button (which blurs the input, so the keyboard starts
            // closing at the same moment this dialog opens) — leaving a
            // sliver uncovered. Fixed pins it to the true viewport
            // directly, independent of that.
            // Inset from the safe areas rather than a flat inset:0: Safari
            // samples the app's actual rendered content near the screen
            // edges to color its own chrome (status bar/toolbar), not just
            // the static theme-color meta tag — that's why it can get
            // "stuck" showing a dark tint after this scrim closes. Never
            // painting dark behind the status bar/home indicator in the
            // first place means there's nothing dark there for Safari to
            // pick up and cache.
            position: 'fixed',
            top: 'env(safe-area-inset-top, 0px)',
            bottom: 'env(safe-area-inset-bottom, 0px)',
            left: 0,
            right: 0,
            background: 'rgba(36,31,61,.5)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="card-lg" style={{ width: 'calc(100% - 32px)', textAlign: 'center' }}>
            <p
              className="b-font"
              style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.5, marginBottom: 18 }}
            >
              {t(uiLang, 'exitGameConfirm')}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button
                id="exit-confirm-yes"
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={onConfirmExit}
              >
                {t(uiLang, 'exitGame')}
              </Button>
              <Button
                id="exit-confirm-no"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={onCloseExitConfirm}
              >
                {t(uiLang, 'returnToGame')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
