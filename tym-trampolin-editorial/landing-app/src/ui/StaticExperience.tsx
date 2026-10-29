import { t } from "./locale";
function gearPath() {
  return (
    Array.from({ length: 48 }, (_, i) => {
      const angle = (i / 48) * Math.PI * 2;
      const radius = i % 4 === 1 || i % 4 === 2 ? 76 : 63;
      return `${i === 0 ? "M" : "L"}${100 + Math.cos(angle) * radius},${100 + Math.sin(angle) * radius}`;
    }).join(" ") + "Z"
  );
}

export function StaticExperience({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  return (
    <div className="static-experience">
      <p className="eyebrow">{t("STEJNÝ PŘÍBĚH. KLIDNĚJŠÍ TEMPO.", "THE SAME STORY. A CALMER PACE.")}</p>
      <h1>
        {t("Z pevného základu.", "From solid foundations.")}
        <br />
        <em>{t("Do pohybu.", "Into motion.")}</em>
      </h1>
      <p className="static-description">
        {t("Každá změna začíná tím, co už máme. Nový pohled dá známým věcem nový smysl.", "Every change starts with what we already have. A fresh perspective gives familiar things new meaning.")}
      </p>
      <div
        className="static-models"
        role="img"
        aria-label={t("Pěstní klín se mění v ozubené kolo, symbol pohybu.", "A hand axe transforms into a gear, a symbol of motion.")}
      >
        <figure>
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <path
              fill="#777267"
              d="M105 10 118 35 130 68 145 111 148 144 134 172 105 189 79 184 59 166 51 139 61 98 77 57 94 19Z"
            />
            <path fill="#B8B0A0" d="M105 10 103 64 77 57 94 19Z" />
            <path fill="#998269" d="M77 57 103 64 91 111 61 98Z" />
            <path fill="#4B4842" d="M105 10 118 35 130 68 103 64Z" />
            <path fill="#777267" d="M103 64 130 68 145 111 91 111Z" />
            <path fill="#B8B0A0" d="M61 98 91 111 79 146 51 139Z" />
            <path fill="#998269" d="M91 111 145 111 120 152 79 146Z" />
            <path fill="#4B4842" d="M145 111 148 144 134 172 120 152Z" />
            <path fill="#777267" d="M51 139 79 146 79 184 59 166Z" />
            <path fill="#998269" d="M79 146 120 152 134 172 105 189 79 184Z" />
          </svg>
          <figcaption>{t("01 / PĚSTNÍ KLÍN", "01 / HAND AXE")}</figcaption>
        </figure>
        <figure>
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <path
              fill="#DCE7FF"
              fillRule="evenodd"
              d={`${gearPath()} M125 100a25 25 0 1 0-50 0a25 25 0 1 0 50 0Z`}
            />
          </svg>
          <figcaption>{t("05 / KOVOVÉ KOLO", "05 / METAL GEAR")}</figcaption>
        </figure>
      </div>
      <p className="fallback-note" role="status">
        {reducedMotion
          ? t("Respektujeme nastavení omezeného pohybu. Příběh zobrazujeme bez animace.", "We respect your reduced-motion setting. The story is shown without animation.")
          : t("3D zobrazení není dostupné. Prohlédněte si statickou variantu příběhu.", "3D is unavailable. Explore the static version of the story.")}
      </p>
    </div>
  );
}
