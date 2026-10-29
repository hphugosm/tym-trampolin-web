/** Migration-only change: public play must not depend on newsletter registration.
 * Fail closed on upstream drift, rather than silently shipping a gated game. */
export function ungateKilometry(html) {
  const replaceOnce = (before, after) => {
    if (html.split(before).length !== 2) throw Error('Kilometry migration: expected exactly one upstream gate marker: ' + before.slice(0, 65));
    html = html.replace(before, after);
  };
  replaceOnce('  const GAME_ACCESS_KEY = "tt_game_access_v1";\n  const GAME_USER_KEY = "tt_game_user_v1";\n', '');
  const identityStart = html.indexOf('  function hasAccess() {');
  const identityEnd = html.indexOf('  function escapeHtml(value) {', identityStart);
  if (identityStart < 0 || identityEnd < 0) throw Error('Kilometry migration: upstream identity block missing');
  html = html.slice(0, identityStart) + `  // Guest identity is local to this game; no newsletter profile is read.
  function getCurrentUser() {
    return { name: 'Hráč', email: 'local@player' };
  }

` + html.slice(identityEnd);
  replaceOnce(`    if (!hasAccess()) {
      toast('Nejdřív registrace na hlavní stránce');
      setStatus('Nejdřív vyplň newsletter na hlavní stránce, tím odemkneš hru Kilometry Jdeš.');
      return;
    }

`, '');
  const statusStart = html.indexOf('  const user = getCurrentUser();\n  if (!hasAccess()) {');
  const statusEnd = html.indexOf('  if (tracker && tracker.trackPageView)', statusStart);
  if (statusStart < 0 || statusEnd < 0) throw Error('Kilometry migration: upstream welcome gate missing');
  html = html.slice(0, statusStart) + `  setStatus('Hraj rovnou bez registrace. Spusť běh a drž rytmus.');

` + html.slice(statusEnd);
  replaceOnce(`    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));`, `    // Private browsing or denied storage must never interrupt a run.
    try { localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard)); } catch (e) {}`);
  replaceOnce('Leaderboard se teď ukládá lokálně. Pro globální leaderboard nastav endpoint v tracking konfiguraci.', 'Hraj bez registrace. Skóre se ukládá jen v tomto prohlížeči, pokud je úložiště dostupné.');
  if (/hasAccess|GAME_ACCESS_KEY|GAME_USER_KEY|tt_game_access|tt_game_user|postMessage|vyplň newsletter|Nejprve se registruj/.test(html))
    throw Error('Kilometry migration: registration dependency remains');
  return html;
}
