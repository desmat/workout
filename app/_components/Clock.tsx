export default function Clock({ ms }: { ms: number }) {
  // console.log('>> app.workout[id].Page. Timer', { ms });
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 1000 / 60) % 60;
  const h = Math.floor(ms / 60 / 60 / 1000);

  return (
    <span
      className="font-mono"
    >
      {`${(h + "").padStart(2, '0')}:${(m + "").padStart(2, '0')}:${(s + "").padStart(2, '0')}`}
    </span>
  )
}
