function ExecuteButton({ isLoading }) {
  return (
    <button
      type="submit"
      className="mt-2 border border-terminalGreen px-4 py-2 text-sm uppercase tracking-[0.16em] text-terminalGreen transition hover:bg-terminalGreen hover:text-terminalBlack focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terminalGreen disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isLoading}
    >
      [{isLoading ? ' EXECUTING... ' : ' EXECUTE '}]
    </button>
  )
}

export default ExecuteButton
