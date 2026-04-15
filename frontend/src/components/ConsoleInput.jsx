function ConsoleInput({ id, label, type = 'text', value, onChange, autoComplete }) {
  return (
    <label htmlFor={id} className="flex w-full flex-col gap-2 text-left">
      <span className="text-xs uppercase tracking-[0.14em] text-terminalGreen/70">
        {label}
      </span>
      <div className="flex items-center border border-terminalGreen px-3 py-2">
        <span className="mr-2 text-terminalGreen/90">{'>_'}</span>
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="w-full bg-transparent text-sm text-terminalGreen outline-none placeholder:text-terminalGreen/40"
          placeholder="input..."
          required
        />
      </div>
    </label>
  )
}

export default ConsoleInput
