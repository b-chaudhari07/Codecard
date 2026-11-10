interface ExampleBannerProps {
  onStart: () => void
}

export function ExampleBanner({ onStart }: ExampleBannerProps) {
  return (
    <section className="section-shell pt-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-gold/25 bg-gold/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-silver">
          <span className="font-semibold text-ink">Example profile.</span>{' '}
          Enter your handle to make your own.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 px-3.5 py-2 text-[12px] font-medium text-gold transition-colors hover:bg-gold/15"
        >
          Make my card
        </button>
      </div>
    </section>
  )
}
