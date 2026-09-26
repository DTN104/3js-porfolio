import { useLayoutEffect, useRef } from 'react'

// Native modal dialogs keep focus inside, make the world inert, and restore focus.
export default function Modal({ className, label, onClose, children }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const dialog = ref.current
    dialog.showModal()
    return () => dialog.close()
  }, [])
  return (
    <dialog ref={ref} className={className} aria-label={label}
      onCancel={e => { e.preventDefault(); onClose?.() }}
      onClick={e => { if (e.target === e.currentTarget) onClose?.() }}>
      {children}
    </dialog>
  )
}
