document.addEventListener('DOMContentLoaded', () => {
  renderClients();
  document.getElementById('client-search').addEventListener('input', (e) => renderClients(e.target.value));
  const params = new URLSearchParams(location.search);
  if(params.get('new') === '1') novaNewClient();
  novaIcons();
});

function initials(name){
  return name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
}

function clientStats(clientId){
  const d = NOVA.data();
  const facs = d.factures.filter(f => f.clientId === clientId);
  const total = facs.reduce((s,f) => s + NOVA.docTotals(f.items).total, 0);
  const paid = facs.filter(f=>f.status==='Payée').reduce((s,f) => s + NOVA.docTotals(f.items).total, 0);
  return { count: facs.length, total, paid, unpaid: total - paid };
}

function renderClients(filter=''){
  const d = NOVA.data();
  const f = filter.toLowerCase();
  const tbody = document.getElementById('client-tbody');
  const rows = d.clients.filter(c => c.name.toLowerCase().includes(f) || c.email.toLowerCase().includes(f));
  tbody.innerHTML = rows.map(c => {
    const s = clientStats(c.id);
    return `<tr style="cursor:pointer" onclick="novaOpenClient('${c.id}')">
      <td class="row-client"><div class="avatar" style="width:26px;height:26px;font-size:10px;">${initials(c.name)}</div><span class="cell-primary">${c.name}</span></td>
      <td class="cell-muted">${c.phone}</td>
      <td class="cell-muted">${c.email}</td>
      <td class="cell-num">${NOVA.fmt(s.total)}</td>
      <td class="cell-num">${s.count}</td>
      <td class="cell-muted">${c.createdAt.split('-').reverse().join('/')}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="6"><div class="empty-state"><i data-lucide="users" class="es-icon"></i>Aucun client trouvé</div></td></tr>`;
  novaIcons();
}

function novaOpenClient(id){
  const c = NOVA.client(id);
  if(!c) return;
  document.getElementById('view-list').style.display = 'none';
  document.getElementById('view-detail').style.display = 'block';

  document.getElementById('cd-avatar').textContent = initials(c.name);
  document.getElementById('cd-name').textContent = c.name;
  document.getElementById('cd-contact').textContent = `${c.phone} · ${c.email}`;

  const s = clientStats(c.id);
  novaCountUp(document.getElementById('cd-total'), s.total, { money:true, duration:600 });
  novaCountUp(document.getElementById('cd-paid'), s.paid, { money:true, duration:600 });
  novaCountUp(document.getElementById('cd-unpaid'), s.unpaid, { money:true, duration:600 });

  const d = NOVA.data();
  const devisRows = d.devis.filter(x => x.clientId === id).map(x => ({ type:'Devis', id:x.id, date:x.date, total:NOVA.docTotals(x.items).total, status:x.status }));
  const facRows = d.factures.filter(x => x.clientId === id).map(x => ({ type:'Facture', id:x.id, date:x.date, total:NOVA.docTotals(x.items).total, status:x.status }));
  const all = [...devisRows, ...facRows].sort((a,b) => b.date.localeCompare(a.date));

  const statusClassAll = { 'Payée':'paid','En attente':'pending','En retard':'overdue','Brouillon':'draft','Envoyé':'sent','Accepté':'accepted','Refusé':'refused','Expiré':'expired' };
  document.getElementById('cd-history').innerHTML = all.map(r => `
    <tr><td>${r.type}</td><td class="cell-primary">${r.id}</td><td class="cell-muted">${r.date.split('-').reverse().join('/')}</td>
    <td class="cell-num">${NOVA.fmt(r.total)}</td><td><span class="status ${statusClassAll[r.status]}">${r.status}</span></td></tr>`).join('')
    || `<tr><td colspan="5"><div class="empty-state">Aucun historique</div></td></tr>`;
}

function novaCloseDetail(){
  document.getElementById('view-detail').style.display = 'none';
  document.getElementById('view-list').style.display = 'block';
  renderClients();
}

function novaNewClient(){
  const name = prompt('Nom du client :');
  if(!name) return;
  const client = {
    id: 'c' + Date.now(),
    name, phone: '+212 6 00 00 00 00', email: name.toLowerCase().replace(/\s+/g,'.') + '@email.com',
    type: 'Particulier', createdAt: new Date().toISOString().slice(0,10)
  };
  NOVA.addClient(client);
  novaToast(`${name} ajouté à vos clients`);
  renderClients();
}
