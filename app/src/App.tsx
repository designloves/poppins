import { Button } from '@base-ui/react/button'
import './App.css'

function App() {
  return (
    <main className="placeholder">
      <h1>Poppins</h1>
      <p>React + TypeScript rewrite in progress — nothing here is live yet.</p>
      <Button className="placeholder-button" onClick={() => alert('Base UI is wired up.')}>
        Base UI button (unstyled)
      </Button>
    </main>
  )
}

export default App
