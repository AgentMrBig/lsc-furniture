// Elegant line-art placeholders used until real project photography is added.
// TODO(owner): replace with real photos (drop files in /public/portfolio and
// swap <FurnitureArt> for <Image> in the pages that use it).

const ART: Record<string, React.ReactNode> = {
  table: (
    <>
      <path d="M20 60 H140" />
      <path d="M30 60 V110 M130 60 V110" />
      <path d="M20 56 H140" strokeWidth="6" opacity="0.35" />
    </>
  ),
  desk: (
    <>
      <path d="M20 55 H140" />
      <path d="M28 55 V110 M132 55 V110" />
      <rect x="88" y="62" width="40" height="22" rx="2" />
      <path d="M92 73 H124" opacity="0.5" />
    </>
  ),
  shelf: (
    <>
      <rect x="35" y="25" width="90" height="95" rx="2" />
      <path d="M35 55 H125 M35 85 H125" />
      <path d="M50 43 h18 M78 43 h12 M50 73 h24 M92 73 h14 M60 108 h30" opacity="0.5" />
    </>
  ),
  chair: (
    <>
      <path d="M55 25 V85 M55 70 H105 M105 70 V110 M55 85 V110" />
      <path d="M55 30 Q80 22 102 30 L102 62" opacity="0.6" />
    </>
  ),
  credenza: (
    <>
      <rect x="25" y="45" width="110" height="50" rx="3" />
      <path d="M80 45 V95 M25 70 H80" opacity="0.6" />
      <circle cx="70" cy="72" r="2.5" /><circle cx="90" cy="72" r="2.5" />
      <path d="M35 95 V110 M125 95 V110" />
    </>
  ),
  bed: (
    <>
      <path d="M25 40 V100 M135 60 V100 M25 100 H135" />
      <path d="M25 78 H135" opacity="0.6" />
      <rect x="32" y="62" width="34" height="12" rx="5" opacity="0.6" />
    </>
  ),
};

export default function FurnitureArt({
  kind,
  className = "",
}: {
  kind: keyof typeof ART | string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 160 135"
      className={className}
      role="img"
      aria-label="Furniture sketch — project photo coming soon"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ART[kind] ?? ART.table}
    </svg>
  );
}
