import { CoinFlight } from './components/CoinFlight'
import { ScreenFx } from './components/ScreenFx'
import { ViewportDebugBadge } from './components/ViewportDebugBadge'
import { Done } from './screens/Done'
import { Home } from './screens/Home'
import { Lists } from './screens/Lists'
import { Login } from './screens/Login'
import { Paste } from './screens/Paste'
import { PracticeSetup } from './screens/PracticeSetup'
import { Quiz } from './screens/Quiz'
import { Settings } from './screens/Settings'
import { useAppState } from './state/useAppState'

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
      onNewList={state.openNewList}
      onEditList={state.openEditList}
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
        onAddNew={state.openNewList}
        onSelect={state.selectList}
        onDelete={state.deleteListById}
      />
    )
  } else if (state.screen === 'paste') {
    content = (
      <Paste
        avatar={state.avatar}
        uiLang={state.uiLang}
        pasteName={state.pasteName}
        setPasteName={state.setPasteName}
        pasteText={state.pasteText}
        setPasteText={state.setPasteText}
        pasteParsed={state.pasteParsed}
        pasteStep={state.pasteStep}
        editingListId={state.editingListId}
        pastePair={state.pastePair}
        pasteLoading={state.pasteLoading}
        onClose={state.closePaste}
        onChangeFrom={state.changePasteFrom}
        onChangeTo={state.changePasteTo}
        onParse={state.submitPasteParse}
        onBack={state.backToPasteStep}
        onSave={state.savePasteList}
      />
    )
  } else if (state.screen === 'settings') {
    content = (
      <Settings
        avatar={state.avatar}
        uiLang={state.uiLang}
        soundOn={state.soundOn}
        pronunciationOn={state.pronunciationOn}
        currentUser={state.currentUser}
        onBack={() => state.navigate('home')}
        onLogin={state.openLogin}
        onLogout={state.logout}
        onSetAvatar={state.setAvatar}
        onSetUiLang={state.setUiLang}
        onToggleSound={() => state.setSoundOn((v) => !v)}
        onTogglePronunciation={() => state.setPronunciationOn((v) => !v)}
      />
    )
  } else if (state.screen === 'login') {
    content = (
      <Login
        avatar={state.avatar}
        uiLang={state.uiLang}
        loginEmail={state.loginEmail}
        loginSent={state.loginSent}
        loginErr={state.loginErr}
        loginLoading={state.loginLoading}
        onChangeEmail={state.setLoginEmail}
        onSubmit={state.submitLogin}
        onSkip={state.skipLogin}
      />
    )
  } else if (state.screen === 'home') {
    content = home
  }

  return (
    <div id="frame">
      <div id="screen">{content}</div>
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
      {new URLSearchParams(window.location.search).get('debug') === '1' && <ViewportDebugBadge />}
    </div>
  )
}

export default App
