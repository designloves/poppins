import { Home } from './screens/Home'
import { Placeholder } from './screens/Placeholder'
import { PracticeSetup } from './screens/PracticeSetup'
import { useAppState } from './state/useAppState'

const PLACEHOLDER_TITLES = {
  quiz: 'Quiz',
  lists: 'My lists',
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

  if (state.screen === 'home') return home

  if (state.screen === 'practiceSetup') {
    // Same guard the legacy app's own screen renderer has
    // (screens.practiceSetup redirects home if activeList() is null).
    if (!state.activeList) return home
    return (
      <PracticeSetup
        list={state.activeList}
        uiLang={state.uiLang}
        onBack={() => state.navigate('home')}
        onStart={state.startQuiz}
      />
    )
  }

  return <Placeholder title={PLACEHOLDER_TITLES[state.screen]} navigate={state.navigate} />
}

export default App
