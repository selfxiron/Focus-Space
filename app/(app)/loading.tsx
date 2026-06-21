export default function AppLoading() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-8 animate-pulse">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[108px] rounded-[20px] bg-secondary/80"
          />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-[360px] rounded-[20px] bg-secondary/60 lg:col-span-2" />
        <div className="h-[360px] rounded-[20px] bg-secondary/60" />
      </div>
      <div className="h-[120px] rounded-[20px] bg-secondary/50" />
    </div>
  );
}
