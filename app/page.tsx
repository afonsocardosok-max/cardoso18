export default function Home() {
  return (
    <main className="min-h-screen bg-[#0d0a09] text-white">
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        
        <p className="mb-4 text-sm tracking-[0.45em] text-white/60">
          25 · 09 · 2026
        </p>

        <h1 className="text-6xl font-light tracking-[0.18em] sm:text-8xl">
          CARDOSO
        </h1>

        <p className="mt-5 text-xl tracking-[0.5em] text-white/70">
          18 ANOS
        </p>

        <div className="my-12 h-px w-24 bg-white/30" />

        <p className="max-w-sm text-base leading-7 text-white/70">
          Uma noite. Muitas histórias.
          <br />
          Partilha os teus momentos.
        </p>

        <a
  href="/upload"
  className="mt-10 rounded-full border border-white/40 px-8 py-4 text-sm tracking-[0.25em] transition hover:bg-white hover:text-black"
>
  ENVIAR FOTOGRAFIAS
</a>

        <p className="mt-8 text-xs tracking-[0.2em] text-white/35">
          THE BEST PARTY
        </p>

      </section>
    </main>
  );
}