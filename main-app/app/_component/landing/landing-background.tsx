export function LandingBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-0 -translate-x-1/2">
        <div className="size-[34rem] rounded-full bg-primary/10 blur-3xl animate-blob-drift motion-reduce:animate-none" />
      </div>
      <div className="absolute top-56 right-0 translate-x-1/3">
        <div className="size-[24rem] rounded-full bg-secondary/30 blur-3xl animate-blob-drift motion-reduce:animate-none [animation-duration:32s] [animation-delay:-6s]" />
      </div>
      <div className="absolute bottom-0 left-0 -translate-x-1/4">
        <div className="size-[26rem] rounded-full bg-accent/60 blur-3xl animate-blob-drift motion-reduce:animate-none [animation-duration:28s] [animation-delay:-12s]" />
      </div>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
