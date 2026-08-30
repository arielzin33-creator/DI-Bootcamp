import { useEffect, useRef } from 'react'

function FocusInput() {
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (inputRef.current !== null) {
      inputRef.current.focus()
    }
  }, [])

  const handleClick = (): void => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="focus-input">
      <input ref={inputRef} type="text" placeholder="I focus on mount" />
      <button type="button" onClick={handleClick}>
        Focus Input
      </button>
    </div>
  )
}

export default FocusInput
