import { Button } from '@base-ui/react/button'
import { AvatarImage } from '../components/AvatarImage'
import { CoinPouch } from '../components/CoinPouch'
import { accentText, COLOR_MAP } from '../data/constants'
import type { AvatarKey, WordList } from '../data/constants'
import { LANGUAGE_CODES, t, wordsCountText } from '../data/i18n'
import type { UiLang } from '../data/i18n'
import { ArrowRight, Bloom, Books, Pencil, Plus } from '../icons/icons'
import { Mascot } from '../icons/Mascot'
import type { Screen } from '../state/useAppState'

interface HomeProps {
  avatar: AvatarKey
  coins: number
  coinBump: boolean
  uiLang: UiLang
  activeList: WordList | null
  showGreeting: boolean
  greetingHiding: boolean
  navigate: (screen: Screen) => void
  greetMascot: (greeting: string) => void
  onNewList: () => void
  onEditList: () => void
}

export function Home({
  avatar,
  coins,
  coinBump,
  uiLang,
  activeList,
  showGreeting,
  greetingHiding,
  navigate,
  greetMascot,
  onNewList,
  onEditList,
}: HomeProps) {
  const accent = accentText(avatar)

  return (
    <div
      style={{
        padding: '8px 16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        minHeight: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bloom size={26} color="#B583E8" center="#F2EE5B" spinning />
          <span className="h-font" style={{ fontSize: 24, color: 'var(--ink)' }}>
            Poppins
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <CoinPouch coins={coins} bump={coinBump} />
          <Button
            title={t(uiLang, 'settingsTitle')}
            onClick={() => navigate('settings')}
            style={{
              position: 'relative',
              overflow: 'visible',
              width: 44,
              height: 44,
              borderRadius: 999,
              background: 'var(--paper-alt)',
              border: 'var(--border-thin)',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
            }}
          >
            <AvatarImage avatar={avatar} diameter={44} />
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Button
            title={t(uiLang, 'sayHi')}
            onClick={() => greetMascot(t(uiLang, 'mascotGreeting'))}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <Mascot size={120} mood="happy" />
          </Button>
          {showGreeting && (
            <div
              className="speech-bubble b-font"
              style={{
                animation: greetingHiding
                  ? 'pop-out 180ms ease-in forwards'
                  : 'pop-in 200ms ease-out',
              }}
            >
              {t(uiLang, 'mascotGreeting')}
            </div>
          )}
        </div>
      </div>

      {activeList ? (
        <ListCard
          list={activeList}
          uiLang={uiLang}
          accent={accent}
          navigate={navigate}
          onEditList={onEditList}
          onNewList={onNewList}
        />
      ) : (
        <EmptyListCard uiLang={uiLang} navigate={navigate} onNewList={onNewList} />
      )}
    </div>
  )
}

function ListCard({
  list,
  uiLang,
  accent,
  navigate,
  onEditList,
  onNewList,
}: {
  list: WordList
  uiLang: UiLang
  accent: string
  navigate: (screen: Screen) => void
  onEditList: () => void
  onNewList: () => void
}) {
  return (
    <>
      <div
        className="card-lg"
        style={{
          background: COLOR_MAP[list.color] ?? '#FFB0C8',
          position: 'relative',
          overflow: 'hidden',
          padding: 16,
        }}
      >
        <Button
          title={t(uiLang, 'editList')}
          onClick={onEditList}
          style={{
            position: 'absolute',
            top: 15,
            right: 15,
            background: 'var(--paper)',
            border: 'var(--border-thin)',
            borderRadius: 999,
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2,
          }}
        >
          <Pencil size={17} color="#241F3D" />
        </Button>
        <div style={{ paddingRight: 46 }}>
          <div className="label-caps">{t(uiLang, 'todaysList')}</div>
          <h2
            className="h-font"
            style={{
              fontSize: 32,
              color: 'var(--ink)',
              margin: '4px 0 0',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            {list.name}
          </h2>
          <div
            className="m-font"
            style={{ fontSize: 13, color: 'var(--ink)', marginTop: 8, opacity: 0.8 }}
          >
            {wordsCountText(uiLang, list.words.length)} · {LANGUAGE_CODES[list.from] ?? 'SV'} →{' '}
            {LANGUAGE_CODES[list.to] ?? 'EN'}
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <Button
            className="btn btn-primary btn-lg btn-full"
            onClick={() => navigate('practiceSetup')}
          >
            {t(uiLang, 'startPractice')} <ArrowRight size={18} color={accent} />
          </Button>
        </div>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', gap: 10 }}>
        <Button className="btn btn-tertiary" onClick={() => navigate('lists')}>
          <Books size={16} color="#241F3D" /> {t(uiLang, 'myLists')}
        </Button>
        <Button className="btn btn-tertiary" onClick={onNewList}>
          <Plus size={16} color="#241F3D" /> {t(uiLang, 'newList')}
        </Button>
      </div>
    </>
  )
}

function EmptyListCard({
  uiLang,
  navigate,
  onNewList,
}: {
  uiLang: UiLang
  navigate: (screen: Screen) => void
  onNewList: () => void
}) {
  return (
    <div
      className="card-lg"
      style={{ background: 'var(--butter-soft)', textAlign: 'center', padding: 16 }}
    >
      <h2 className="h-font" style={{ fontSize: 28, color: 'var(--ink)' }}>
        {t(uiLang, 'noWordsYet')}
      </h2>
      <p
        className="b-font"
        style={{ color: 'var(--ink-soft)', fontSize: 15, margin: '8px 0 16px' }}
      >
        {t(uiLang, 'pickListOrPaste')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button className="btn btn-primary btn-full" onClick={() => navigate('lists')}>
          <Books size={18} color="#241F3D" /> {t(uiLang, 'pickAList')}
        </Button>
        <Button className="btn btn-tertiary btn-full" onClick={onNewList}>
          <Plus size={16} color="#241F3D" /> {t(uiLang, 'pasteMyOwn')}
        </Button>
      </div>
    </div>
  )
}
