let facStatusFilter = 'all';
let facSearch = '';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  if(params.get('filter') === 'impayes') facStatusFilter = 'impayes';
  if(params.get('new') === '1') novaNewFacture();

  renderFactures();
  document.getElementById('fac-search').addEventListener('input', (e) => { facSearch = e.target.value; renderFactures(); });
  novaIcons();
});

function statusClassFac(s){ return { 'Payée':'paid', 'En attente':'pending', 'En retard':'overdue' }[s] || 'pending'; }

function novaFilterStatus(s){ facStatusFilter = s; renderFactures(); }

function renderFactures(){
  const d = NOVA.data();
  const f = facSearch.toLowerCase();
  let rows = d.factures.filter(fac => {
    const c = NOVA.client(fac.clientId);
    return fac.id.toLowerCase().includes(f) || (c && c.name.toLowerCase().includes(f));
  });
  if(facStatusFilter === 'En retard') rows = rows.filter(r => r.status === 'En retard');
  if(facStatusFilter === 'impayes') rows = rows.filter(r => r.status !== 'Payée');

  const tbody = document.getElementById('fac-tbody');
  tbody.innerHTML = rows.map(fac => {
    const c = NOVA.client(fac.clientId);
    const total = NOVA.docTotals(fac.items).total;
    return `<tr>
      <td class="cell-primary">${fac.id}</td>
      <td>${c ? c.name : '—'}</td>
      <td class="cell-muted">${fac.date.split('-').reverse().join('/')}</td>
      <td class="cell-num">${NOVA.fmt(total)}</td>
      <td><span class="status ${statusClassFac(fac.status)}">${fac.status}</span></td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" title="Voir" onclick="novaToast('Ouverture de ${fac.id}')"><i data-lucide="eye"></i></button>
          <button class="icon-btn" title="Télécharger" onclick="novaToast('Téléchargement du ${fac.id}')"><i data-lucide="download"></i></button>
          <button class="icon-btn" title="Envoyer" onclick="novaToast('${fac.id} envoyé au client')"><i data-lucide="send"></i></button>
          ${fac.status !== 'Payée' ? `<button class="icon-btn" title="Marquer comme payée" onclick="novaMarkPaid('${fac.id}')"><i data-lucide="check-circle"></i></button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('') || `<tr><td colspan="6"><div class="empty-state"><i data-lucide="receipt" class="es-icon"></i>Aucune facture trouvée</div></td></tr>`;
  novaIcons();
}

function novaMarkPaid(id){
  NOVA.updateFactureStatus(id, 'Payée');
  novaToast(`${id} marquée comme payée`);
  renderFactures();
}

function novaNewFacture(){
  const d = NOVA.data();
  const nums = d.factures.map(f => parseInt(f.id.split('-')[1])).filter(n=>!isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  const fac = {
    id: 'FAC-' + String(next).padStart(3,'0'),
    clientId: d.clients[0].id,
    date: new Date().toISOString().slice(0,10),
    status: 'En attente',
    items: [{ name: 'Climatiseur 12000 BTU', qty: 1, price: 3500 }]
  };
  NOVA.addFacture(fac);
  novaToast(`${fac.id} créée`);
  renderFactures();
}
