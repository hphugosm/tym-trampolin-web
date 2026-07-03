<script>
  import { filtered, updateTx, removeTx, duplicateTx } from '../../../features/finance/store';
  import { projectLabel, projectAccent, categoryLabel, STATUS_LABELS, STATUS_ACCENT, PROJECTS, categoriesFor } from '../../../features/finance/config';
  import { fmtCZK } from '../../../features/finance/service';

  export let onOpen = () => {};
  export let onDelete = () => {};

  let edit = null;   // { id, field }
  let editVal = '';
  let menuFor = null;
  let clickTimer = null;

  const fmtDay = (d) => new Date(d).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: '2-digit' });

  function rowClick(tx) {
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => onOpen(tx), 180); // zpoždění, ať dvojklik stihne editaci
  }
  function startEdit(tx, field, current, e) {
    e.stopPropagation();
    clearTimeout(clickTimer);
    edit = { id: tx.id, field };
    editVal = current == null ? '' : String(current);
  }
  function commit(tx) {
    if (!edit) return;
    const f = edit.field;
    let val = editVal;
    if (f === 'amount') val = parseFloat(editVal) || 0;
    if (tx[f] !== val) updateTx(tx.id, { [f]: val });
    edit = null;
  }
  function keydown(e, tx) {
    if (e.key === 'Enter') commit(tx);
    if (e.key === 'Escape') edit = null;
  }
  const isEdit = (id, field) => edit && edit.id === id && edit.field === field;

  function menuAction(tx, action) {
    menuFor = null;
    if (action === 'duplicate') duplicateTx(tx);
    else if (action === 'paid') updateTx(tx.id, { status: 'paid' });
    else if (action === 'archive') updateTx(tx.id, { archived: true });
    else if (action === 'delete') onDelete(tx);
  }
</script>

<svelte:window on:click={() => (menuFor = null)} />

<div class="dash-scroll">
  <table class="dash-table">
    <thead>
      <tr><th>Datum</th><th>Název</th><th>Projekt</th><th>Kategorie</th><th>Typ</th><th style="text-align:right;">Částka</th><th>Stav</th><th>Poznámka</th><th></th></tr>
    </thead>
    <tbody>
      {#if $filtered.length === 0}
        <tr><td colspan="9" class="dash-muted">Žádné transakce — přidej první přes „+ Přidat položku".</td></tr>
      {/if}
      {#each $filtered as tx (tx.id)}
        <tr class="fin-row" on:click={() => rowClick(tx)}>
          <td class="dash-mono" style="white-space:nowrap;">{fmtDay(tx.date)}</td>

          <td class:fin-cell-edit={isEdit(tx.id, 'title')} on:dblclick={(e) => startEdit(tx, 'title', tx.title, e)}>
            {#if isEdit(tx.id, 'title')}
              <input class="fin-edit-input" bind:value={editVal} on:click|stopPropagation on:blur={() => commit(tx)} on:keydown={(e) => keydown(e, tx)} autofocus />
            {:else}<span class="text-white">{tx.title}</span>{/if}
          </td>

          <td on:dblclick={(e) => startEdit(tx, 'project', tx.project, e)}>
            {#if isEdit(tx.id, 'project')}
              <select class="fin-edit-input" bind:value={editVal} on:click|stopPropagation on:change={() => commit(tx)}>
                {#each PROJECTS as p}<option value={p.id}>{p.label}</option>{/each}
              </select>
            {:else}
              <span style="color:{projectAccent(tx.project)};" class="dash-mono" style:font-size="0.72rem">{projectLabel(tx.project)}</span>
            {/if}
          </td>

          <td class="dash-muted" style="font-size:0.75rem;">{categoryLabel(tx.category)}</td>

          <td><span class="dash-mono" style="font-size:0.7rem; color:{tx.type === 'income' ? 'var(--color-emerald)' : 'var(--color-rose)'};">{tx.type === 'income' ? '↑ příjem' : '↓ náklad'}</span></td>

          <td style="text-align:right;" class:fin-cell-edit={isEdit(tx.id, 'amount')} on:dblclick={(e) => startEdit(tx, 'amount', tx.amount, e)}>
            {#if isEdit(tx.id, 'amount')}
              <input class="fin-edit-input" type="number" bind:value={editVal} on:click|stopPropagation on:blur={() => commit(tx)} on:keydown={(e) => keydown(e, tx)} autofocus />
            {:else}
              <span class="dash-mono" class:fin-amount-in={tx.type === 'income'} class:fin-amount-out={tx.type === 'expense'}>{tx.type === 'income' ? '+' : '−'}{fmtCZK(tx.amount)}</span>
            {/if}
          </td>

          <td on:dblclick={(e) => startEdit(tx, 'status', tx.status, e)}>
            {#if isEdit(tx.id, 'status')}
              <select class="fin-edit-input" bind:value={editVal} on:click|stopPropagation on:change={() => commit(tx)}>
                {#each Object.entries(STATUS_LABELS) as [id, label]}<option value={id}>{label}</option>{/each}
              </select>
            {:else}
              <span class="fin-status" style="--sc:{STATUS_ACCENT[tx.status]};">{STATUS_LABELS[tx.status]}</span>
            {/if}
          </td>

          <td class="dash-muted" style="max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" class:fin-cell-edit={isEdit(tx.id, 'note')} on:dblclick={(e) => startEdit(tx, 'note', tx.note, e)}>
            {#if isEdit(tx.id, 'note')}
              <input class="fin-edit-input" bind:value={editVal} on:click|stopPropagation on:blur={() => commit(tx)} on:keydown={(e) => keydown(e, tx)} autofocus />
            {:else}{tx.note || '—'}{/if}
          </td>

          <td style="position:relative;" on:click|stopPropagation>
            <button class="fin-rowmenu-btn" on:click={() => (menuFor = menuFor === tx.id ? null : tx.id)} aria-label="Akce">⋯</button>
            {#if menuFor === tx.id}
              <div class="fin-menu" style="left:auto; right:0;">
                <button on:click={() => menuAction(tx, 'duplicate')}>Duplikovat</button>
                <button on:click={() => menuAction(tx, 'paid')}>Označit jako zaplaceno</button>
                <button on:click={() => menuAction(tx, 'archive')}>Archivovat</button>
                <button on:click={() => menuAction(tx, 'delete')} style="color:var(--color-rose);">Smazat</button>
              </div>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
