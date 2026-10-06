import { Button } from '@base-ui/react/button'

interface DialogProps {
  message: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel?: () => void
}

// A themed stand-in for window.alert()/window.confirm() — those render as
// the browser's own native chrome (plain, unstyled, "says Safari" in the
// prompt), breaking out of the app's look. Shares its visual language
// (card-lg, the scrim, safe-area insets) with Quiz's exit-confirm dialog,
// but lives at the app root so any screen can raise one via useAppState's
// showAlert()/showConfirm() instead of each screen building its own.
export function Dialog({ message, confirmLabel, cancelLabel, onConfirm, onCancel }: DialogProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 'env(safe-area-inset-top, 0px)',
        bottom: 'env(safe-area-inset-bottom, 0px)',
        left: 0,
        right: 0,
        background: 'rgba(36,31,61,.5)',
        zIndex: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="card-lg" style={{ width: 'calc(100% - 32px)', textAlign: 'center' }}>
        <p
          className="b-font"
          style={{
            fontSize: 16,
            color: 'var(--ink)',
            lineHeight: 1.5,
            marginBottom: 18,
            whiteSpace: 'pre-line',
          }}
        >
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          {cancelLabel && onCancel && (
            <Button
              id="app-dialog-cancel"
              className="btn btn-tertiary"
              style={{ flex: 1 }}
              onClick={onCancel}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            id="app-dialog-confirm"
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
