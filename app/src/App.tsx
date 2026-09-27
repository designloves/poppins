import { CoinFlight } from './components/CoinFlight'
import { ScreenFx } from './components/ScreenFx'
import { Done } from './screens/Done'
import { Home } from './screens/Home'
import { Lists } from './screens/Lists'
import { Placeholder } from './screens/Placeholder'
import { PracticeSetup } from './screens/PracticeSetup'
import { Quiz } from './screens/Quiz'
import { useAppState } from './state/useAppState'

const PLACEHOLDER_TITLES = {
  paste: 'New / edit list',
  settings: 'Settings',
} as const

function App() {
  const state = useAppState()

  const home = (
    <Home
      avatar={state.avatar}
      coins={state.coins}
      coinBump={state.coinBump}
      uiLang={state.uiLang}
      activeList={state.activeList}
      showGreeting={state.showGreeting}
      greetingHiding={state.greetingHiding}
      navigate={state.navigate}
      greetMascot={state.greetMascot}
    />
  )

  let content = home

  if (state.screen === 'practiceSetup' && state.activeList) {
    // Same guard the legacy app's own screen renderer has
    // (screens.practiceSetup redirects home if activeList() is null).
    content = (
      <PracticeSetup
        list={state.activeList}
        uiLang={state.uiLang}
        onBack={() => state.navigate('home')}
        onStart={state.startQuiz}
      />
    )
  } else if (state.screen === 'quiz' && state.activeList) {
    content = (
      <Quiz
        list={state.activeList}
        avatar={state.avatar}
        uiLang={state.uiLang}
        coins={state.coins}
        coinBump={state.coinBump}
        quizWords={state.quizWords}
        quizIdx={state.quizIdx}
        quizRight={state.quizRight}
        quizWrong={state.quizWrong}
        quizReversed={state.quizReversed}
        quizAnswer={state.quizAnswer}
        setQuizAnswer={state.setQuizAnswer}
        quizFeedback={state.quizFeedback}
        quizAnim={state.quizAnim}
        quizWriteMode={state.quizWriteMode}
        quizReps={state.quizReps}
        showExitConfirm={state.showExitConfirm}
        onSubmit={state.submitQuizAnswer}
        onCheckWrite5={state.checkWrite5}
        onAdvance={state.advanceQuiz}
        onOpenExitConfirm={state.openExitConfirm}
        onCloseExitConfirm={state.closeExitConfirm}
        onConfirmExit={state.confirmExit}
      />
    )
  } else if (state.screen === 'done') {
    content = (
      <Done
        result={state.result}
        avatar={state.avatar}
        uiLang={state.uiLang}
        onHome={() => state.navigate('home')}
        onPlayAgain={state.playAgain}
      />
    )
  } else if (state.screen === 'lists') {
    content = (
      <Lists
        lists={state.lists}
        activeListId={state.activeListId}
        avatar={state.avatar}
        uiLang={state.uiLang}
        onBack={() => state.navigate('home')}
        onAddNew={() => state.navigate('paste')}
        onSelect={state.selectList}
        onDelete={state.deleteListById}
      />
    )
  } else if (state.screen === 'paste' || state.screen === 'settings') {
    content = <Placeholder title={PLACEHOLDER_TITLES[state.screen]} navigate={state.navigate} />
  } else if (state.screen === 'home') {
    content = home
  }

  return (
    <div id="frame" style={{ position: 'relative', minHeight: '100vh' }}>
      {content}
      <div
        id="fx-layer"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 40,
          overflow: 'hidden',
        }}
      >
        {state.screenFx && <ScreenFx kind={state.screenFx.kind} />}
        {state.coinFlights.map((flight) => (
          <CoinFlight key={flight.id} {...flight} />
        ))}
      </div>
    </div>
  )
}

export default App
