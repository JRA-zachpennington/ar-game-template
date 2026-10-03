const paths = {
  leaf: "M20 4C8 1 2 8 6 15s16 4 14-11ZM5 21 15 9M10 14h5",
  arrow: "M4 12h15m-6-6 6 6-6 6",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  sparkle: "m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8Z",
  camera:
    "M4 6h4l2-3h4l2 3h4a2 2 0 0 1 2 2v11H2V8a2 2 0 0 1 2-2ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  close: "m6 6 12 12M6 18 18 6",
  book: "M12 5C8 2 4 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-4-2-7-1-10 1Zm0 0v16",
  pause: "M8 5v14M16 5v14",
  play: "m8 4 13 8-13 8Z",
  check: "m5 12 4 4L20 5",
  sound: "M11 4 6 8H2v8h4l5 4ZM15 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14",
  muted: "M11 4 6 8H2v8h4l5 4Zm5 5 6 6m0-6-6 6",
  help: "M9 8a3 3 0 1 1 5 3c-1 1-2 1-2 3m0 3v.1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  reset: "M3 10a9 9 0 1 1 1 7M3 3v7h7",
  clock: "M12 6v6l4 3M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  print: "M6 8V2h12v6M6 17H2V8h20v9h-4M6 14h12v8H6ZM18 11h.1",
};
export function Icon({ name, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.sparkle} />
    </svg>
  );
}
