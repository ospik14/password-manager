import BlinkingCursor from './BlinkingCursor'

function TerminalHeading({ title, subtitle }) {
  return (
    <header className="space-y-2 text-left">
      <h1 className="animate-flicker text-3xl uppercase tracking-[0.2em] text-terminalGreen md:text-4xl">
        {title}
        <span className="ml-2">
          <BlinkingCursor />
        </span>
      </h1>
      <p className="text-sm uppercase tracking-[0.08em] text-terminalGreen/70">
        {subtitle}
      </p>
    </header>
  )
}

export default TerminalHeading
