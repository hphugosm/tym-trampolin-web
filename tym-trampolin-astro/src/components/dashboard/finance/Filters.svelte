<script>
  import { filters, resetFilters, emptyFilters } from '../../../features/finance/store';
  import { PROJECTS, ALL_CATEGORIES, STATUS_LABELS, categoryLabel, projectLabel } from '../../../features/finance/config';

  $: active = Object.entries($filters).filter(([k, v]) => v && v !== '');
  const clearOne = (k) => filters.update((f) => ({ ...f, [k]: '' }));
  const chipLabel = (k, v) => {
    if (k === 'project') return projectLabel(v);
    if (k === 'category') return categoryLabel(v);
    if (k === 'type') return v === 'income' ? 'Příjem' : 'Náklad';
    if (k === 'status') return STATUS_LABELS[v] || v;
    if (k === 'search') return '„' + v + '"';
    if (k === 'amountMin') return 'od ' + v;
    if (k === 'amountMax') return 'do ' + v;
    if (k === 'dateFrom') return 'od ' + v;
    if (k === 'dateTo') return 'do ' + v;
    return v;
  };
</script>

<div class="fin-filters">
  <input class="fin-input" placeholder="Hledat…" bind:value={$filters.search} />
  <select class="fin-select" bind:value={$filters.project}><option value="">Projekt: vše</option>{#each PROJECTS as p}<option value={p.id}>{p.label}</option>{/each}</select>
  <select class="fin-select" bind:value={$filters.category}><option value="">Kategorie: vše</option>{#each ALL_CATEGORIES as c}<option value={c.id}>{c.label}</option>{/each}</select>
  <select class="fin-select" bind:value={$filters.type}><option value="">Typ: vše</option><option value="income">Příjem</option><option value="expense">Náklad</option></select>
  <select class="fin-select" bind:value={$filters.status}><option value="">Stav: vše</option>{#each Object.entries(STATUS_LABELS) as [id, label]}<option value={id}>{label}</option>{/each}</select>
  <input class="fin-input" type="date" bind:value={$filters.dateFrom} title="Datum od" />
  <input class="fin-input" type="date" bind:value={$filters.dateTo} title="Datum do" />
  <input class="fin-input" type="number" placeholder="Kč od" bind:value={$filters.amountMin} />
  <input class="fin-input" type="number" placeholder="Kč do" bind:value={$filters.amountMax} />
  <input class="fin-input" placeholder="Klient" bind:value={$filters.client} />
</div>

{#if active.length}
  <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px; align-items:center;">
    {#each active as [k, v]}
      <span class="fin-chip">{chipLabel(k, v)}<button on:click={() => clearOne(k)} aria-label="Odebrat">×</button></span>
    {/each}
    <button class="dash-btn" style="padding:3px 10px;" on:click={resetFilters}>Vymazat vše</button>
  </div>
{/if}
