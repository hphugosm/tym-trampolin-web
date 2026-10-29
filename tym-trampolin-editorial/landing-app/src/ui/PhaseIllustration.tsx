import { t } from "./locale";
export function PhaseIllustration({ phase }: { phase: string }) {
  return (
    <svg
      className="phase-illustration"
      viewBox="0 0 200 200"
      role="img"
      aria-label={`${t("Statická ilustrace", "Static illustration")}: ${({ stone: t("pěstní klín", "hand axe"), gear: t("ozubené kolo", "gear"), bulb: t("žárovka", "light bulb"), chip: t("čip", "chip"), rocket: t("raketa", "rocket") } as Record<string, string>)[phase] ?? phase}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      {phase === "stone" ? (
        <path d="M106 12 139 71 158 140 137 181 97 190 57 169 44 126 64 67Z M106 12 91 76 139 71 108 122 158 140 M64 67 91 76 66 136 108 122 97 190 M44 126 66 136 57 169 M108 122 137 181" />
      ) : phase === "gear" ? (
        <>
          <path
            d="m83 20 34 0 5 18 13 7 18-5 17 29-13 14v16l13 14-17 29-18-5-13 7-5 18H83l-5-18-13-7-18 5-17-29 13-14V83L30 69l17-29 18 5 13-7Z"
            transform="translate(0 15)"
          />
          <circle cx="100" cy="107" r="28" />
        </>
      ) : phase === "bulb" ? (
        <>
          <path d="M76 139c0-22-28-36-28-67a52 52 0 0 1 104 0c0 31-28 45-28 67Z M76 150h48 M80 162h40 M88 174h24 M90 139 78 84l22 12 22-12-12 55 M100 5V0 M22 72H8 M178 72h14 M43 20 31 8 M157 20l12-12" />
        </>
      ) : phase === "chip" ? (
        <>
          <rect x="47" y="47" width="106" height="106" rx="9" />
          <rect x="65" y="65" width="70" height="70" />
          <path d="M70 47V22m20 25V22m20 25V22m20 25V22M70 153v25m20-25v25m20-25v25m20-25v25M47 70H22m25 20H22m25 20H22m25 20H22M153 70h25m-25 20h25m-25 20h25m-25 20h25" />
        </>
      ) : (
        <>
          <path d="M100 12c34 29 35 78 20 124H80C65 90 66 41 100 12Z M76 94 48 137l32-7 M124 94l28 43-32-7 M86 148l14 35 14-35" />
          <circle cx="100" cy="72" r="16" />
        </>
      )}
    </svg>
  );
}
