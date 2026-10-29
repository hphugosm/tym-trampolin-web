import { useInitialAnchorRestore } from "./ui/useInitialAnchorRestore";
import { locale, t } from "./ui/locale";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createEvolutionStore } from "./engine/store";
import { chooseQuality, supportsWebGL2 } from "./engine/quality";
import { useWebsiteScroll } from "./engine/websiteScroll";
import { useDeferredScene } from "./ui/useDeferredScene";
import { useMediaQuery } from "./ui/useMediaQuery";
import { useChapterReveal } from "./ui/useChapterReveal";
import { contact, originalLogo, results, team } from "./ui/content";
import { PhaseIllustration } from "./ui/PhaseIllustration";
import { SceneLight } from "./ui/SceneLight";
import { HeroContours } from "./ui/HeroContours";
const WebsiteCanvas = lazy(() => import("./scene/WebsiteCanvas"));
const navigation = [
  [t("/cs/projekty/", "/projects/"), t("Projekty", "Projects")],
  [t("/cs/o-nas/", "/about/"), t("O nás", "About")],
  [t("/cs/nase-cesta/", "/journey/"), t("Naše cesta", "Our journey")],
  [t("/cs/blog/", "/blog/"), t("TT Blog", "TT Blog")],
  [t("/cs/spoluprace/", "/collaborate/"), t("Spolupráce", "Collaborate")],
];
export default function App() {
  const [store] = useState(createEvolutionStore);
  const [quality] = useState(chooseQuality);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [menu, setMenu] = useState(false);
  const [sectionHash, setSectionHash] = useState(() => window.location.hash);
  useEffect(() => {
    const updateHash = () => setSectionHash(window.location.hash);
    window.addEventListener("hashchange", updateHash);
    return () => {
      window.removeEventListener("hashchange", updateHash);
    };
  }, []);
  const main = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const compact = useMediaQuery("(max-width: 760px)");
  useEffect(() => {
    if (!compact) setMenu(false);
  }, [compact]);
  const { conserve, requested, visible } = useDeferredScene(reduced || menu);
  const fallback = reduced || conserve || webgl === false;
  const [sceneReady, setSceneReady] = useState(false);
  const active = visible && !menu;
  const showScene = requested && !fallback && webgl === true;
  const onSceneReady = useCallback(() => setSceneReady(true), []);
  useEffect(() => {
    if (!showScene) setSceneReady(false);
  }, [showScene]);
  const onFailure = useCallback(() => setWebgl(false), []);
  useEffect(() => {
    if (requested && !reduced && !conserve && active) setWebgl(supportsWebGL2());
  }, [requested, reduced, conserve, active]);
  useWebsiteScroll(main, store, showScene && active);
  useChapterReveal(main, fallback);
  useInitialAnchorRestore(sceneReady || fallback);
  useEffect(() => {
    if (!menu) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("keydown", close);
      document.body.style.overflow = overflow;
    };
  }, [menu]);
  const phaseFigure = (phase: string) =>
    fallback || !sceneReady ? <PhaseIllustration phase={phase} /> : null;
  return (
    <div className={`website ${fallback ? "static-mode" : ""}`}>
      <a className="skip-link" href="#main">{t("Přejít na obsah", "Skip to content")}</a>
      <header className="header">
        <a href="#hero" className="wordmark" onClick={() => setMenu(false)} aria-label={t("Tým Trampolín — úvod", "Tým Trampolín — home")}>
          <img className="brand-symbol" src="/assets/brand/tt-symbol-small.webp" width="112" height="84" alt="" decoding="async" />
          <span className="brand-wordmark">TÝM<br />TRAMPOLÍN</span>
        </a>
        <span className="header-note">{t("STUDENTSKÝ TECHNOLOGICKÝ TÝM", "STUDENT TECHNOLOGY TEAM")}</span>
        <button
          ref={menuButton}
          className="menu-toggle"
          aria-controls="navigation"
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? t("Zavřít −", "Close −") : "Menu +"}
        </button>
        <nav
          id="navigation"
          className={menu ? "navigation open" : "navigation"}
          aria-label={t("Hlavní navigace", "Main navigation")}
        >
          {navigation.map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenu(false)}
            >
              {label}
            </a>
          ))}
          <a href={`${locale === "cs" ? "/" : "/cs/"}${sectionHash}`} hrefLang={locale === "cs" ? "en" : "cs"} lang={locale === "cs" ? "en" : "cs"} aria-label={t("Switch to English", "Přepnout do češtiny")}>
            {locale === "cs" ? "EN" : "CS"}
          </a>
        </nav>
      </header>
      <HeroContours />
      {!fallback && (
        <div className="website-scene" aria-hidden="true">
          {showScene && (
            <Suspense fallback={null}>
              <WebsiteCanvas
                store={store}
                quality={quality}
                onFailure={onFailure}
                active={active}
                onReady={onSceneReady}
              />
            </Suspense>
          )}
        </div>
      )}
      {!fallback && <SceneLight />}
      <main ref={main} id="main" inert={menu}>
        <section
          id="hero"
          data-chapter="hero"
          className="chapter hero object-right"
        >
          <div className="chapter-lead">
            <h1>{t("HISTORIE ZNÁ", "HISTORY TAKES")}<br />{t("VELKÉ KROKY.", "GREAT STEPS.")}<br />
              <em>{t("MY DĚLÁME", "WE TAKE")}<br />{t("SKOKY.", "LEAPS.")}</em>
            </h1>
            <p className="lead-description">
              {t("Jsme Tým Trampolín. Studentský technologický tým, který experimentuje, vyvíjí a soutěží.", "We are Tým Trampolín. A student technology team that experiments, builds and competes.")}
            </p>
            <div className="actions">
              <a className="primary-link" href={t("/cs/projekty/", "/projects/")}>{t("Naše projekty", "Our projects")}</a>
              <a className="text-link" href="#team">{t("Poznej tým", "Meet the team")}</a>
            </div>
          </div>
          {phaseFigure("stone")}
        </section>
        <section
          id="about"
          data-chapter="about"
          className="chapter about object-left"
        >
          <div className="chapter-lead">
            <h2>{t("NEJDŘÍV", "FIRST,")}<br />{t("TO ", "WE ")}<em>{t("ZKUSÍME.", "TRY IT.")}</em>
            </h2>
            <p className="lead-description">
              {t("Spojujeme programování, umělou inteligenci, hardware a kreativní experimenty. Učíme se tím, že tvoříme.", "We bring together programming, AI, hardware and creative experiments. We learn by making.")}
            </p>
            <p className="quiet-copy">
              {t("Od prvního nápadu k funkčnímu prototypu. Od otázky „co kdyby“ k tomu, co si můžeme sami vyzkoušet.", "From the first idea to a working prototype. From asking “what if” to something we can try ourselves.")}
            </p>
          </div>
          {phaseFigure("gear")}
        </section>
        <section
          id="projects"
          data-chapter="projects"
          className="chapter projects object-right"
        >
          <div className="chapter-lead">
            <h2>{t("PERMANENTNĚ", "ALWAYS")}<br />{t("VE ", "IN ")}<em>{t("VÝVOJI.", "DEVELOPMENT.")}</em>
            </h2>
            <p className="lead-description">
              {t("Co nás zajímá, to zkoušíme postavit. Tohle jsou projekty, které už mají vlastní příběh.", "When something interests us, we try to build it. These projects already have a story of their own.")}
            </p>
            <a
              className="primary-link"
              href={t("/cs/projekty/", "/projects/")}
            >{t("Prozkoumejte projekty", "Explore projects")}</a>
          </div>
          {phaseFigure("bulb")}
        </section>
        <section
          id="results"
          data-chapter="results"
          className="chapter results object-left"
        >
          <div className="chapter-lead">
            <h2>{t("TOHLE NÁS", "NO ONE")}<br />{t("NIKDO ", "TAUGHT US ")}<em>{t("NEUČIL.", "THIS.")}</em>
            </h2>
            <p className="lead-description">
              {t("Výzvy nás dostávají dál. Soutěžíme, tvoříme pod tlakem a učíme se od lidí kolem nás.", "Challenges take us further. We compete, create under pressure and learn from the people around us.")}
            </p>
          </div>
          {phaseFigure("chip")}
          <div className="content-band results-list">
            {results.map((result) => (
              <article className="result" key={result.name}>
                <div className="result-place">
                  {result.place}
                  <small>{result.label}</small>
                </div>
                <h3>
                  <a
                    className="result-link"
                    href={result.source}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${t("Zdroj výsledku", "Result source:")} ${result.name} ${result.year}`}
                  >
                    {result.name}
                  </a>
                </h3>
                <span className="result-year">{result.year}</span>
              </article>
            ))}
          </div>
        </section>
        <section
          id="team"
          data-chapter="team"
          className="chapter team object-right"
        >
          <div className="chapter-lead">
            <h2>{t("ZA KAŽDÝM", "BEHIND EVERY")}<br />{t("SKOKEM", "LEAP")}<br />{t("STOJÍ ", "ARE ")}<em>{t("LIDÉ.", "PEOPLE.")}</em>
            </h2>
            <p className="lead-description">
              {t("Jsme tým. Každý přináší vlastní pohled, společně hledáme cestu k dalšímu nápadu.", "We are a team. Everyone brings a different perspective; together we find a way to the next idea.")}
            </p>
          </div>
          {phaseFigure("rocket")}
          <div className="content-band team-content">
            <img
              className="team-photo"
              src="/media/team-trio.webp"
              alt={t("Předávání cen při finále DemocraTIConu", "Award ceremony at the DemocraTICon final")}
              width="1400"
              height="775"
              loading="lazy"
            />
            <p className="team-photo-caption">{t("Z finále DemocraTIConu. Olomouc, 2026.", "At the DemocraTICon final. Olomouc, 2026.")}</p>
            <div className="member-list">
              {team.map((person) => (
                <article className="person" key={person.name}>
                  <h3>{person.name}</h3>
                  <p>{person.role}</p>
                </article>
              ))}
            </div>
          </div>
          {!fallback && (
            <div className="launch-runway" data-launch-runway>
              <p className="eyebrow">{t("PŘIPRAVENI NA DALŠÍ SKOK", "READY FOR THE NEXT LEAP")}</p>
              <p className="launch-copy">{t("Nekončíme.", "We are not stopping.")}<br />
                <em>{t("Startujeme.", "We are launching.")}</em>
              </p>
              <span className="eyebrow">{t("POKRAČUJTE DÁL", "KEEP SCROLLING")}</span>
            </div>
          )}
        </section>
        <section
          id="future"
          data-chapter="future"
          className="chapter future object-right"
        >
          <div className="chapter-lead">
            <h2>{t("DALŠÍ", "THE NEXT")}<br />{t("VELKÝ ", "BIG ")}<em>{t("SKOK.", "LEAP.")}</em>
            </h2>
            <p className="lead-description">
              {t("Máte výzvu, nápad nebo chuť něco vytvořit? Pojďme zjistit, kam nás to společně dostane.", "Have a challenge, an idea or the urge to create? Let’s see how far we can go together.")}
            </p>
            <a className="primary-link" href={t("/cs/spoluprace/#collab-choice-title", "/collaborate/#collab-choice-title")}>{t("Spolupracuj s námi", "Work with us")}</a>
          </div>
          {phaseFigure("rocket")}
          <div className="content-band finale">
            <div className="logo-slot">
              {originalLogo ? (
                <img src={originalLogo} alt={t("Logo Týmu Trampolín", "Tým Trampolín logo")} width="336" height="252" loading="lazy" decoding="async" />
              ) : (
                <>
                  <span className="eyebrow">TÝM TRAMPOLÍN</span>

                </>
              )}
            </div>
            <p>{t("Historie zná velké kroky.", "History takes great steps.")}<br />
              <em>{t("My děláme skoky.", "We take leaps.")}</em>
            </p>
          </div>
        </section>
      </main>
      <footer id="contact" className="footer" inert={menu}>
        <div className="footer-top">
          <p className="eyebrow">{t("DALŠÍ SKOK ZAČÍNÁ ZPRÁVOU.", "THE NEXT LEAP STARTS WITH A MESSAGE.")}</p>
          <a className="email" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
        </div>
        <div className="footer-bottom">
          <a className="wordmark" href="#hero" aria-label={t("Tým Trampolín — úvod", "Tým Trampolín — home")}>
            <img className="brand-symbol" src="/assets/brand/tt-symbol-small.webp" width="112" height="84" alt="" loading="lazy" decoding="async" />
            <span className="brand-wordmark">TÝM<br />TRAMPOLÍN</span>
          </a>
          <nav aria-label={t("Sociální sítě", "Social links")}>
            <a href={contact.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href={contact.twitch} target="_blank" rel="noreferrer">
              Twitch
            </a>
            <a href={contact.github} target="_blank" rel="noreferrer">{t("Zdroj webu / GitHub", "Website source / GitHub")}</a>
          </nav>
          <span>
            © 2026 TÝM TRAMPOLÍN
            <br />{t("ZVĚDAVOST NÁS POSOUVÁ.", "CURIOSITY MOVES US FORWARD.")}</span>
        </div>
      </footer>
    </div>
  );
}
