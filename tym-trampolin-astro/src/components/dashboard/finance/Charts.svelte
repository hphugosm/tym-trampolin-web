<script>
  import { filtered, projectRollup } from '../../../features/finance/store';
  import { categoryBreakdown, fmtCZK } from '../../../features/finance/service';
  import { categoryLabel, categoryAccent, projectLabel, projectAccent } from '../../../features/finance/config';

  $: expenses = categoryBreakdown($filtered, 'expense');
  $: expTotal = expenses.reduce((s, e) => s + e.value, 0) || 1;

  // donut segmenty
  $: segs = (() => {
    const C = 2 * Math.PI * 46;
    let off = 0;
    return expenses.map((e) => {
      const frac = e.value / expTotal;
      const s = { color: categoryAccent(e.category), dash: frac * C, offset: -off * C, label: categoryLabel(e.category), value: e.value };
      off += frac;
      return s;
    });
  })();
  const C = 2 * Math.PI * 46;
</script>

<div class="dash-grid" style="grid-template-columns:1fr 1fr;">
  <div class="dash-panel">
    <div class="dash-eyebrow" style="--pa:var(--color-rose);">Náklady</div>
    <div class="dash-panel-title" style="margin-bottom:14px;">Podle kategorie</div>
    {#if expenses.length}
      <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
        <svg viewBox="0 0 120 120" width="130" height="130" style="transform:rotate(-90deg); flex-shrink:0;">
          <circle cx="60" cy="60" r="46" fill="none" stroke="var(--color-ink-3)" stroke-width="14" />
          {#each segs as s}
            <circle cx="60" cy="60" r="46" fill="none" stroke={s.color} stroke-width="14" stroke-dasharray={`${s.dash} ${C - s.dash}`} stroke-dashoffset={s.offset} />
          {/each}
        </svg>
        <ul style="flex:1; min-width:140px; display:flex; flex-direction:column; gap:5px;">
          {#each expenses as e}
            <li style="display:flex; align-items:center; gap:8px; font-size:0.8rem;">
              <span style="width:9px; height:9px; background:{categoryAccent(e.category)}; flex-shrink:0;"></span>
              <span style="color:var(--color-text-secondary);">{categoryLabel(e.category)}</span>
              <span class="dash-mono" style="margin-left:auto; color:#fff;">{fmtCZK(e.value)}</span>
            </li>
          {/each}
        </ul>
      </div>
    {:else}<p class="dash-muted" style="font-size:0.85rem;">Žádné náklady ve výběru.</p>{/if}
  </div>

  <div class="dash-panel">
    <div class="dash-eyebrow" style="--pa:var(--color-emerald);">Projekty</div>
    <div class="dash-panel-title" style="margin-bottom:14px;">Zisk podle projektu</div>
    {#if $projectRollup.length}
      <div style="display:flex; flex-direction:column; gap:9px;">
        {#each $projectRollup as p}
          <div>
            <div style="display:flex; justify-content:space-between; gap:8px; margin-bottom:3px;">
              <span style="font-size:0.82rem; color:{projectAccent(p.project)};">{projectLabel(p.project)}</span>
              <span class="dash-mono" style="font-size:0.8rem; color:{p.profit >= 0 ? 'var(--color-emerald)' : 'var(--color-rose)'};">{p.profit >= 0 ? '+' : '−'}{fmtCZK(Math.abs(p.profit))}</span>
            </div>
            <div style="display:flex; gap:2px; height:7px;">
              <div style="background:var(--color-emerald); opacity:0.8; width:{p.income + p.expense ? (p.income / (p.income + p.expense)) * 100 : 0}%;" title="Příjmy {fmtCZK(p.income)}"></div>
              <div style="background:var(--color-rose); opacity:0.8; width:{p.income + p.expense ? (p.expense / (p.income + p.expense)) * 100 : 0}%;" title="Náklady {fmtCZK(p.expense)}"></div>
            </div>
            <div class="dash-mono" style="font-size:0.62rem; color:var(--color-text-muted); margin-top:2px;">marže {p.margin} % · {p.count} pol.</div>
          </div>
        {/each}
      </div>
    {:else}<p class="dash-muted" style="font-size:0.85rem;">Zatím žádná data.</p>{/if}
  </div>
</div>
