<script>
  import { categoriesFor, PROJECTS, AI_PROVIDERS, STATUS_LABELS } from '../../../features/finance/config';
  import { fmtCZK } from '../../../features/finance/service';
  import { addTx, updateTx, removeTx, duplicateTx } from '../../../features/finance/store';

  export let tx = null;          // existující transakce | null pro novou
  export let preset = {};        // předvyplnění (quick-add)
  export let onClose = () => {};

  const blank = {
    date: new Date().toISOString().slice(0, 10),
    title: '', type: 'expense', amount: '', category: '', project: 'general',
    status: 'paid', note: '', client: '', invoiceNumber: '', dueDate: '',
    aiProvider: '', recurring: 'none', attachments: [],
  };

  let draft = init();
  let showOptional = false;
  let saving = false;
  let err = '';

  function init() {
    if (tx) return { ...tx, amount: String(tx.amount) };
    return { ...blank, ...preset };
  }

  $: cats = categoriesFor(draft.type);
  $: if (draft.category && !cats.find((c) => c.id === draft.category)) draft.category = '';
  $: isAi = draft.category === 'ai';

  function validate() {
    if (!draft.title.trim()) return 'Zadej název.';
    const a = parseFloat(draft.amount);
    if (!a || a <= 0) return 'Zadej částku větší než 0.';
    if (!draft.category) return 'Vyber kategorii.';
    return '';
  }

  async function save(addAnother = false) {
    err = validate();
    if (err) return;
    saving = true;
    const payload = {
      date: draft.date, title: draft.title.trim(), type: draft.type,
      amount: parseFloat(draft.amount), category: draft.category, project: draft.project,
      status: draft.status, note: draft.note.trim(),
      client: draft.client || undefined, invoiceNumber: draft.invoiceNumber || undefined,
      dueDate: draft.dueDate || undefined, aiProvider: isAi ? (draft.aiProvider || undefined) : undefined,
      recurring: draft.recurring, attachments: draft.attachments || [], archived: false,
    };
    let ok = true;
    if (tx) await updateTx(tx.id, payload);
    else ok = await addTx(payload);
    saving = false;
    if (!ok) return;
    if (addAnother && !tx) { draft = { ...blank, type: draft.type, project: draft.project, category: draft.category }; err = ''; }
    else onClose();
  }

  async function del() {
    if (tx) { await removeTx(tx.id); onClose(); }
  }
  async function dup() {
    if (tx) { await duplicateTx(tx); onClose(); }
  }
</script>

<div class="fin-drawer-backdrop" on:click={onClose} role="presentation"></div>
<aside class="fin-drawer" role="dialog" aria-label="Transakce">
  <div class="fin-drawer-head">
    <div>
      <div class="dash-eyebrow" style="--pa:var(--color-gold);">{tx ? 'Detail transakce' : 'Nová položka'}</div>
      <div class="dash-panel-title">{tx ? tx.title : 'Přidat transakci'}</div>
    </div>
    <button class="dash-btn" on:click={onClose}>Zavřít</button>
  </div>

  <div class="fin-drawer-body">
    <div class="fin-field">
      <label>Typ</label>
      <div class="fin-seg">
        <button type="button" class:on={draft.type === 'income'} on:click={() => (draft.type = 'income')}>Příjem</button>
        <button type="button" class:on={draft.type === 'expense'} on:click={() => (draft.type = 'expense')}>Náklad</button>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
      <div class="fin-field"><label>Částka (Kč)</label><input class="fin-input" type="number" min="0" bind:value={draft.amount} placeholder="0" /></div>
      <div class="fin-field"><label>Datum</label><input class="fin-input" type="date" bind:value={draft.date} /></div>
    </div>

    <div class="fin-field"><label>Název</label><input class="fin-input" bind:value={draft.title} placeholder="Např. Klientská platba" /></div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
      <div class="fin-field">
        <label>Projekt</label>
        <select class="fin-select" bind:value={draft.project}>
          {#each PROJECTS as p}<option value={p.id}>{p.label}</option>{/each}
        </select>
      </div>
      <div class="fin-field">
        <label>Kategorie</label>
        <select class="fin-select" bind:value={draft.category}>
          <option value="">— vyber —</option>
          {#each cats as c}<option value={c.id}>{c.label}</option>{/each}
        </select>
      </div>
    </div>

    <div class="fin-field">
      <label>Stav</label>
      <select class="fin-select" bind:value={draft.status}>
        {#each Object.entries(STATUS_LABELS) as [id, label]}<option value={id}>{label}</option>{/each}
      </select>
    </div>

    {#if isAi}
      <div class="fin-field">
        <label>AI provider</label>
        <select class="fin-select" bind:value={draft.aiProvider}>
          <option value="">— vyber —</option>
          {#each AI_PROVIDERS as p}<option value={p.id}>{p.label}</option>{/each}
        </select>
      </div>
    {/if}

    <div class="fin-field"><label>Poznámka</label><input class="fin-input" bind:value={draft.note} placeholder="Volitelné" /></div>

    <button type="button" class="dash-btn" style="width:100%; margin-bottom:12px;" on:click={() => (showOptional = !showOptional)}>
      {showOptional ? '− Skrýt' : '+ Volitelné'} (klient, faktura, splatnost, opakování)
    </button>

    {#if showOptional}
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div class="fin-field"><label>Klient</label><input class="fin-input" bind:value={draft.client} /></div>
        <div class="fin-field"><label>Číslo faktury</label><input class="fin-input" bind:value={draft.invoiceNumber} /></div>
        <div class="fin-field"><label>Splatnost</label><input class="fin-input" type="date" bind:value={draft.dueDate} /></div>
        <div class="fin-field">
          <label>Opakování</label>
          <select class="fin-select" bind:value={draft.recurring}>
            <option value="none">Jednorázově</option><option value="monthly">Měsíčně</option><option value="yearly">Ročně</option>
          </select>
        </div>
      </div>
    {/if}

    {#if tx && tx.history && tx.history.length}
      <div class="fin-field">
        <label>Historie změn</label>
        <ul class="dash-mono" style="font-size:0.7rem; color:var(--color-text-muted);">
          {#each tx.history.slice().reverse() as h}
            <li>{new Date(h.at).toLocaleString('cs-CZ')} — {h.action}</li>
          {/each}
        </ul>
      </div>
    {/if}

    {#if err}<p style="color:var(--color-rose); font-size:0.82rem;">{err}</p>{/if}
  </div>

  <div class="fin-drawer-actions">
    <button class="fin-add" on:click={() => save(false)} disabled={saving}>{tx ? 'Uložit' : 'Uložit'}</button>
    {#if !tx}<button class="dash-btn" on:click={() => save(true)} disabled={saving}>Uložit a přidat další</button>{/if}
    {#if tx}
      <button class="dash-btn" on:click={dup}>Duplikovat</button>
      <button class="dash-btn" style="border-color:var(--color-rose); color:var(--color-rose);" on:click={del}>Odstranit</button>
    {/if}
    <button class="dash-btn" on:click={onClose}>Zrušit</button>
  </div>
</aside>
