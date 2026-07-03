<script>
  import { onMount } from 'svelte';
  import { transactions, filtered, loading, loadError, toast, load, addTx, removeTx } from '../../../features/finance/store';
  import { toCSV } from '../../../features/finance/service';
  import { QUICK_ADD } from '../../../features/finance/config';
  import SummaryCards from './SummaryCards.svelte';
  import Filters from './Filters.svelte';
  import Charts from './Charts.svelte';
  import TxTable from './TxTable.svelte';
  import TxDrawer from './TxDrawer.svelte';
  import Confirm from './Confirm.svelte';

  let drawerOpen = false;
  let drawerTx = null;
  let drawerPreset = {};
  let confirmTx = null;
  let quickOpen = false;
  let fileInput;

  function openNew(preset = {}) { drawerTx = null; drawerPreset = preset; drawerOpen = true; quickOpen = false; }
  function openTx(tx) { drawerTx = tx; drawerPreset = {}; drawerOpen = true; }
  function closeDrawer() { drawerOpen = false; drawerTx = null; }

  function exportCSV() {
    dl(toCSV($transactions), 'finance-' + today() + '.csv', 'text/csv');
  }
  function exportJSON() {
    dl(JSON.stringify($transactions, null, 2), 'finance-' + today() + '.json', 'application/json');
  }
  function dl(content, name, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name; a.click();
  }
  const today = () => new Date().toISOString().slice(0, 10);

  async function onImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const arr = JSON.parse(await file.text());
      if (!Array.isArray(arr)) throw 0;
      for (const t of arr) {
        const { id, createdAt, updatedAt, history, ...rest } = t;
        await addTx(rest);
      }
    } catch { toast.set({ msg: 'Neplatný JSON', kind: 'err' }); }
    e.target.value = '';
  }

  function onKey(e) {
    if (e.target.matches('input, select, textarea')) {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    if (e.key === 'n') { e.preventDefault(); openNew(); }
    if (e.key === '/') { e.preventDefault(); document.querySelector('.fin-filters input')?.focus(); }
    if (e.key === 'Escape') { drawerOpen = false; confirmTx = null; quickOpen = false; }
  }

  onMount(() => {
    load();
    const reload = () => load();
    document.addEventListener('tt:auth', reload);
    window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('tt:auth', reload); window.removeEventListener('keydown', onKey); };
  });
</script>

<div class="fin-toolbar">
  <div style="display:flex; align-items:baseline; gap:10px;">
    <span class="dash-mono" style="font-size:0.72rem; color:var(--color-text-muted);">{$filtered.length} z {$transactions.length} transakcí</span>
  </div>
  <div style="display:flex; gap:8px; align-items:center;">
    <button class="dash-btn" on:click={exportCSV}>Export CSV</button>
    <button class="dash-btn" on:click={exportJSON}>Export JSON</button>
    <button class="dash-btn" on:click={() => fileInput.click()}>Import</button>
    <input bind:this={fileInput} type="file" accept="application/json" on:change={onImport} style="display:none;" />
    <div class="fin-addwrap">
      <button class="fin-add" on:click={() => openNew()}>+ Přidat položku</button>
      <button class="fin-add fin-add-caret" on:click|stopPropagation={() => (quickOpen = !quickOpen)} aria-label="Rychlé přidání">▾</button>
      {#if quickOpen}
        <div class="fin-menu">
          <div class="dash-mono" style="font-size:0.58rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--color-text-muted); padding:4px 10px;">Rychlé přidání</div>
          {#each QUICK_ADD as q}<button on:click={() => openNew(q.patch)}>{q.label}</button>{/each}
        </div>
      {/if}
    </div>
  </div>
</div>

{#if $loading}
  <p class="dash-muted" style="padding:40px; text-align:center;">Načítám finance…</p>
{:else if $loadError === 'unauthorized'}
  <p class="dash-muted" style="padding:40px; text-align:center;">Přihlaš se tokenem výše.</p>
{:else}
  <SummaryCards />
  <div style="height:14px;"></div>
  <Filters />
  <Charts />
  <div style="height:14px;"></div>
  <div class="dash-panel">
    <div class="dash-eyebrow" style="--pa:var(--color-gold);">Ledger</div>
    <div class="dash-panel-title" style="margin-bottom:12px;">Transakce</div>
    <TxTable onOpen={openTx} onDelete={(tx) => (confirmTx = tx)} />
  </div>
{/if}

{#if drawerOpen}
  <TxDrawer tx={drawerTx} preset={drawerPreset} onClose={closeDrawer} />
{/if}

{#if confirmTx}
  <Confirm
    text={`Smazat transakci „${confirmTx.title}"? Nelze vrátit.`}
    onCancel={() => (confirmTx = null)}
    onConfirm={() => { removeTx(confirmTx.id); confirmTx = null; }}
  />
{/if}

{#if $toast}
  <div class="fin-toast {$toast.kind}">{$toast.msg}</div>
{/if}
