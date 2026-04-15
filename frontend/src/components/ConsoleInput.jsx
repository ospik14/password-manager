function ConsoleInput({ id, label, type = 'text', value, onChange, autoComplete }) {
  return (
    <label htmlFor={id} className="flex w-full flex-col gap-2 text-left">
      <span className="text-xs uppercase tracking-[0.14em] text-terminalGreen/70">
        {label}
      </span>
      <div className="terminal-line flex items-center gap-2 px-1 py-2">
        <span className="text-xs text-terminalGreen/70">root@vault:~#</span>
        <span className="text-terminalGreen/85">{id === 'username' ? 'name:' : 'key:'}</span>
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="w-full bg-transparent text-sm text-terminalGreen outline-none placeholder:text-terminalGreen/35"
          placeholder="_"
          required
        />
      </div>
    </label>
  )
}

export default ConsoleInput
