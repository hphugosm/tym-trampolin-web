<script>
  export let text = 'Opravdu?';
  export let confirmLabel = 'Smazat';
  export let onConfirm = () => {};
  export let onCancel = () => {};
</script>

<div class="fin-confirm-backdrop" on:click={onCancel} role="presentation">
  <div class="fin-confirm" on:click|stopPropagation role="dialog">
    <p style="color:#fff; margin-bottom:18px;">{text}</p>
    <div style="display:flex; gap:8px; justify-content:flex-end;">
      <button class="dash-btn" on:click={onCancel}>Zrušit</button>
      <button class="fin-add" style="background:var(--color-rose); border-color:var(--color-rose);" on:click={onConfirm}>{confirmLabel}</button>
    </div>
  </div>
</div>
