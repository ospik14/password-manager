function ExecuteButton({ isLoading }) {
  return (
    <button
      type="submit"
      className={`execute-button mt-2 border border-cyan-300/70 px-4 py-2 text-sm uppercase tracking-[0.16em] text-cyan-300 transition hover:shadow-[0_0_16px_rgba(0,229,255,0.35)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 ${
        isLoading ? 'executing' : ''
      }`}
      disabled={isLoading}
    >
      [{isLoading ? ' CONNECTING... ' : ' CONNECT '}]
    </button>
  )
}

export default ExecuteButton
