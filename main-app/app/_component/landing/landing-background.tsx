export function LandingBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute right-0 top-56 h-[24rem] w-[24rem] translate-x-1/3 rounded-full bg-secondary/30 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-[26rem] w-[26rem] -translate-x-1/4 rounded-full bg-accent/60 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
