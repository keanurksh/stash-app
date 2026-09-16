export default function LoginLoading() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0c1012]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(0, 240, 118, 0.05) 0%, transparent 60%)",
      }}
    >
      <div className="size-12 animate-pulse rounded-xl border border-[#283136] bg-[#161b1e]" />
      <div className="h-5 w-24 animate-pulse rounded bg-[#161b1e]" />
      <div className="h-64 w-full max-w-[420px] animate-pulse rounded-2xl border border-white/10 bg-[#161b1e]/50" />
    </div>
  )
}
