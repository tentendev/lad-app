export function ResourceIcon({
  kind,
  size = 27,
}: {
  kind: "diamond" | "ticket";
  size?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      stroke="#a68cc4"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {kind === "diamond" ? (
        <path d="m2 10 5-6h14l5 6-12 14L2 10Zm0 0h24M7 4l7 20 7-20M7 4l7 6 7-6" />
      ) : (
        <>
          <rect
            x="3"
            y="7"
            width="22"
            height="14"
            rx="1"
            transform="rotate(-13 14 14)"
          />
          <path d="m11 7 3 14M8 13l5-1m-3-2 1 5M18 10l3-.5M19 14l3-.5" />
        </>
      )}
    </svg>
  );
}
