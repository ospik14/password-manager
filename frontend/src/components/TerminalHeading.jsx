import BlinkingCursor from './BlinkingCursor'

function TerminalHeading({ title, subtitle }) {
  return (
    <header className="space-y-2 text-left">
      <h1 className="animate-flicker text-2xl uppercase tracking-[0.14em] text-terminalGreen md:text-3xl">
        {title}
        <span className="ml-2">
          <BlinkingCursor />
        </span>
      </h1>
      <p className="text-xs uppercase tracking-[0.12em] text-terminalGreen/80 md:text-sm">
        {subtitle}
      </p>
    </header>
  )
}

export default TerminalHeading
