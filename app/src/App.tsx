import { Home } from './screens/Home'
import { Placeholder } from './screens/Placeholder'
import { useAppState } from './state/useAppState'

const PLACEHOLDER_TITLES = {
  practiceSetup: 'Practice setup',
  lists: 'My lists',
  paste: 'New / edit list',
  settings: 'Settings',
} as const

function App() {
  const state = useAppState()

  if (state.screen === 'home') {
    return (
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
  }

  return <Placeholder title={PLACEHOLDER_TITLES[state.screen]} navigate={state.navigate} />
}

export default App
