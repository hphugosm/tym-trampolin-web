<script>
  import { summary, filters } from '../../../features/finance/store';
  import { fmtCZK } from '../../../features/finance/service';

  function spark(data, w = 90, h = 24) {
    if (!data || data.length < 2) return '';
    const max = Math.max(...data), min = Math.min(0, ...data), r = max - min || 1;
    return data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / r) * (h - 3) - 1.5}`).join(' ');
  }
  const setFilter = (patch) => filters.update((f) => ({ ...f, ...patch }));

  $: cards = [
    { key: 'income', label: 'Příjmy tento měsíc', value: $summary.income, delta: $summary.incomeDelta, spark: $summary.incomeSpark, accent: 'var(--color-emerald)', good: 'up', filter: { type: 'income', status: '', category: '' } },
    { key: 'expense', label: 'Náklady tento měsíc', value: $summary.expense, delta: $summary.expenseDelta, spark: $summary.expenseSpark, accent: 'var(--color-rose)', good: 'down', filter: { type: 'expense', status: '', category: '' } },
    { key: 'profit', label: 'Zisk tento měsíc', value: $summary.profit, delta: $summary.profitDelta, spark: $summary.profitSpark, accent: 'var(--color-brand)', good: 'up', filter: { type: '', status: '', category: '' } },
    { key: 'pending', label: 'Čekající platby', value: $summary.pending, spark: $summary.pendingSpark, accent: 'var(--color-gold)', good: 'up', filter: { status: 'pending', type: '', category: '' } },
    { key: 'ai', label: 'AI náklady', value: $summary.aiCost, delta: $summary.aiDelta, spark: $summary.aiSpark, accent: 'var(--color-accent-2)', good: 'down', filter: { category: 'ai', type: 'expense', status: '' } },
    { key: 'cashflow', label: 'Cashflow celkem', value: $summary.cashflow, spark: $summary.cashflowSpark, accent: 'var(--color-brand-hot)', good: 'up', filter: { type: '', status: '', category: '' } },
  ];
  function deltaColor(d, good) {
    if (d == null || d === 0) return 'var(--color-text-muted)';
    return (good === 'up' ? d > 0 : d < 0) ? 'var(--color-emerald)' : 'var(--color-rose)';
  }
</script>

<div class="dash-grid" style="grid-template-columns:repeat(6,1fr);">
  {#each cards as c}
    <button class="dash-kpi" style="--pa:{c.accent}; text-align:left; cursor:pointer;" on:click={() => setFilter(c.filter)} title="Filtrovat">
      <div class="dash-kpi-num" style="font-size:1.35rem;">{fmtCZK(c.value)}</div>
      <div class="dash-kpi-label">{c.label}</div>
      <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; margin-top:6px; min-height:20px;">
        {#if c.delta != null}
          <span class="dash-mono" style="font-size:0.66rem; color:{deltaColor(c.delta, c.good)};">{c.delta > 0 ? '▲' : c.delta < 0 ? '▼' : ''} {Math.abs(c.delta)} %</span>
        {:else}<span></span>{/if}
        {#if spark(c.spark)}
          <svg viewBox="0 0 90 24" width="72" height="20" preserveAspectRatio="none"><polyline points={spark(c.spark)} fill="none" stroke={c.accent} stroke-width="1.5" /></svg>
        {/if}
      </div>
    </button>
  {/each}
</div>

<style>
  @media (max-width: 1200px) { div.dash-grid { grid-template-columns: repeat(3, 1fr) !important; } }
  @media (max-width: 640px) { div.dash-grid { grid-template-columns: repeat(2, 1fr) !important; } }
</style>
