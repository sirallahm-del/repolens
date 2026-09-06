let edLines = [];
let edClientId = null;

document.addEventListener('DOMContentLoaded', () => {
  renderDevisList();
  populateClientSelect();

  document.getElementById('devis-search').addEventListener('input', (e) => renderDevisList(e.target.value));

  const params = new URLSearchParams(location.search);
  if(params.get('new') === '1') novaOpenEditor();

  novaIcons();
});

function statusClass(s){
  return { 'Brouillon':'draft', 'Envoyé':'sent', 'Accepté':'accepted', 'Refusé':'refused', 'Expiré':'expired' }[s] || 'draft';
}

function renderDevisList(filter=''){
  const d = NOVA.data();
  const tbody = document.getElementById('devis-tbody');
  const f = filter.toLowerCase();
  const rows = d.devis.filter(dv => {
    const c = NOVA.client(dv.clientId);
    return dv.id.toLowerCase().includes(f) || (c && c.name.toLowerCase().includes(f));
  });
  tbody.innerHTML = rows.map(dv => {
    const c = NOVA.client(dv.clientId);
    const total = NOVA.docTotals(dv.items).total;
    return `<tr>
      <td class="cell-primary">${dv.id}</td>
      <td>${c ? c.name : '—'}</td>
      <td class="cell-muted">${dv.date.split('-').reverse().join('/')}</td>
      <td class="cell-num">${NOVA.fmt(total)}</td>
      <td><span class="status ${statusClass(dv.status)}">${dv.status}</span></td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" title="Télécharger" onclick="novaToast('Téléchargement du ${dv.id}')"><i data-lucide="download"></i></button>
          <button class="icon-btn" title="Envoyer" onclick="novaToast('${dv.id} envoyé au client')"><i data-lucide="send"></i></button>
          <button class="icon-btn" title="Convertir en facture" onclick="novaConvertToFacture('${dv.id}')"><i data-lucide="repeat"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('') || `<tr><td colspan="6"><div class="empty-state"><i data-lucide="file-text" class="es-icon"></i>Aucun devis trouvé</div></td></tr>`;
  novaIcons();
}

function novaConvertToFacture(devisId){
  const fac = NOVA.convertDevisToFacture(devisId);
  if(fac){ novaToast(`Devis converti en ${fac.id}`); renderDevisList(); }
}

function populateClientSelect(){
  const d = NOVA.data();
  const sel = document.getElementById('ed-client');
  sel.innerHTML = d.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  sel.addEventListener('change', () => { edClientId = sel.value; updatePreview(); });
  edClientId = d.clients[0].id;
}

function novaOpenEditor(){
  document.getElementById('view-list').style.display = 'none';
  document.getElementById('view-editor').style.display = 'block';
  edLines = [
    { name: 'Climatiseur 12000 BTU', unit: 'Forfait', qty: 3, price: 3500 },
    { name: "Main d'œuvre", unit: 'Forfait', qty: 1, price: 900 }
  ];
  document.getElementById('ed-description').value = '';
  renderLines();
  document.getElementById('doc-num').textContent = novaNextDevisId();
  const today = new Date();
  const validity = new Date(today); validity.setDate(validity.getDate() + 30);
  document.getElementById('doc-date').textContent = today.toLocaleDateString('fr-FR');
  document.getElementById('doc-validity').textContent = validity.toLocaleDateString('fr-FR');
  updatePreview();
}

function novaCloseEditor(){
  document.getElementById('view-editor').style.display = 'none';
  document.getElementById('view-list').style.display = 'block';
  renderDevisList();
}

function novaNextDevisId(){
  const d = NOVA.data();
  const nums = d.devis.map(x => parseInt(x.id.split('-')[2])).filter(n=>!isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `DEV-2026-${String(next).padStart(3,'0')}`;
}

const NOVA_UNITS = ['Forfait', 'Jours', 'Heures', 'Pièce', 'Mois'];

function renderLines(){
  const wrap = document.getElementById('line-items');
  wrap.innerHTML = edLines.map((l,i) => `
    <div class="line-item">
      <input type="text" value="${l.name}" onchange="edLines[${i}].name=this.value; updatePreview();" placeholder="Description">
      <select onchange="edLines[${i}].unit=this.value; updatePreview();" title="Unité">
        ${NOVA_UNITS.map(u => `<option value="${u}" ${(l.unit||'Forfait')===u?'selected':''}>${u}</option>`).join('')}
      </select>
      <input type="number" value="${l.qty}" min="1" onchange="edLines[${i}].qty=parseFloat(this.value)||1; updatePreview();" title="Quantité">
      <input type="number" value="${l.price}" min="0" onchange="edLines[${i}].price=parseFloat(this.value)||0; updatePreview();" title="Prix">
      <span class="li-remove" onclick="novaRemoveLine(${i})"><i data-lucide="x"></i></span>
    </div>`).join('');
  novaIcons();
}

function novaAddLine(){
  edLines.push({ name:'', unit:'Forfait', qty:1, price:0 });
  renderLines();
  updatePreview();
}
function novaRemoveLine(i){
  edLines.splice(i,1);
  renderLines();
  updatePreview();
}

function novaComputeObjet(){
  const desc = document.getElementById('ed-description').value.trim();
  if(desc) return desc.charAt(0).toUpperCase() + desc.slice(1);
  const names = edLines.filter(l => l.name).map(l => l.name);
  if(names.length) return 'Fourniture et installation : ' + names.join(', ');
  return 'Prestation de services';
}

function updatePreview(){
  const c = NOVA.client(edClientId) || NOVA.client(document.getElementById('ed-client').value);
  document.getElementById('doc-client-name').textContent = c ? c.name : '—';
  document.getElementById('doc-client-phone').textContent = c ? c.phone : '';
  document.getElementById('doc-objet').textContent = novaComputeObjet();

  const items = document.getElementById('doc-items');
  items.innerHTML = edLines.map(l => `
    <tr><td>${l.name || '—'}</td><td>${l.unit || 'Forfait'}</td><td>${l.qty}</td><td>${NOVA.fmtNum(l.price)}</td><td>${NOVA.fmtNum(l.qty*l.price)}</td></tr>`).join('');

  const t = NOVA.docTotals(edLines);
  document.getElementById('doc-sub').textContent = NOVA.fmt(t.sub);
  document.getElementById('doc-tva').textContent = NOVA.fmt(t.tva);
  document.getElementById('doc-total').textContent = NOVA.fmt(t.total);
}

// ---------- AI generation simulation ----------
function novaGenerateAI(){
  const text = document.getElementById('ed-description').value.trim();
  if(!text){ novaToast('Décrivez la prestation pour générer un devis'); return; }

  const modal = document.getElementById('ai-modal');
  modal.classList.add('open');
  const steps = modal.querySelectorAll('.gen-step');
  steps.forEach(s => s.classList.remove('active','done'));

  let i = 0;
  function next(){
    if(i > 0) steps[i-1].classList.remove('active');
    if(i > 0) steps[i-1].classList.add('done');
    if(i > 0) steps[i-1].innerHTML = `<span class="gs-icon"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>` + steps[i-1].textContent;
    if(i < steps.length){
      steps[i].classList.add('active');
      i++;
      setTimeout(next, 480);
    } else {
      setTimeout(() => {
        modal.classList.remove('open');
        edLines = NOVA.parseDescription(text).map(l => ({ unit: 'Forfait', ...l }));
        renderLines();
        updatePreview();
        novaToast('✓ Devis prêt');
      }, 350);
    }
  }
  next();
}

// ---------- Voice capture simulation ----------
function novaVoiceCapture(){
  const btn = document.getElementById('voice-btn');
  const dots = document.getElementById('voice-dots');
  btn.style.display = 'none';
  dots.style.display = 'flex';
  setTimeout(() => {
    dots.style.display = 'none';
    btn.style.display = 'flex';
    document.getElementById('ed-description').value = "Installation de 2 climatiseurs 18000 BTU à 5200 DH chacun, plus main d'œuvre 900 DH";
    novaGenerateAI();
  }, 1800);
}

// ---------- Save ----------
function novaSaveDevis(){
  if(edLines.length === 0 || edLines.every(l=>!l.name)){ novaToast('Ajoutez au moins un article'); return; }
  const devis = {
    id: document.getElementById('doc-num').textContent,
    clientId: document.getElementById('ed-client').value,
    date: new Date().toISOString().slice(0,10),
    status: 'Brouillon',
    items: edLines.filter(l=>l.name)
  };
  NOVA.addDevis(devis);
  novaToast(`${devis.id} enregistré`);
  novaCloseEditor();
}

// ---------- PDF ----------
function novaDownloadPdf(){
  if(!window.jspdf){ novaToast('Génération du PDF...'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:'pt', format:'a4' });
  const c = NOVA.client(document.getElementById('ed-client').value);
  const t = NOVA.docTotals(edLines);
  let y = 60;
  doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.setTextColor(40,86,163);
  doc.text('NOVA', 48, y);
  doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.setTextColor(107,114,128);
  doc.text('Atlas Climatisation — Casablanca', 48, y+16);
  doc.text('ICE: 0021458796000045', 48, y+30);
  doc.setTextColor(26,29,36); doc.setFontSize(20); doc.setFont('helvetica','bold');
  doc.text('DEVIS', 48, y+70);
  doc.setFontSize(11); doc.setFont('helvetica','normal');
  doc.text(document.getElementById('doc-num').textContent, 400, y);
  doc.text('Validité: ' + document.getElementById('doc-validity').textContent, 400, y+16);
  doc.text('Client: ' + (c ? c.name : '—'), 48, y+95);
  doc.setFontSize(10);
  doc.text('Objet: ' + document.getElementById('doc-objet').textContent, 48, y+112, { maxWidth: 500 });

  y += 145;
  doc.setFillColor(40,86,163);
  doc.rect(48, y-12, 499, 18, 'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(10);
  doc.text('Désignation', 54, y); doc.text('Unité', 280, y); doc.text('Qté', 340, y); doc.text('P.U.', 390, y); doc.text('Total HT', 460, y);
  doc.setTextColor(26,29,36); doc.setFont('helvetica','normal'); doc.setFontSize(10.5);
  y += 20;
  edLines.forEach(l => {
    doc.text(String(l.name), 54, y);
    doc.text(String(l.unit || 'Forfait'), 280, y);
    doc.text(String(l.qty), 340, y);
    doc.text(NOVA.fmtNum(l.price), 390, y);
    doc.text(NOVA.fmtNum(l.qty*l.price), 460, y);
    y += 20;
  });
  y += 10;
  doc.setDrawColor(230,232,238);
  doc.line(300, y, 547, y); y += 20;
  doc.setTextColor(107,114,128);
  doc.text('Total HT: ' + NOVA.fmt(t.sub), 400, y); y += 16;
  doc.text('TVA (20%): ' + NOVA.fmt(t.tva), 400, y); y += 18;
  doc.setFillColor(40,86,163);
  doc.rect(390, y-14, 157, 22, 'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(12);
  doc.text('Total TTC: ' + NOVA.fmt(t.total), 398, y+2);

  doc.save((document.getElementById('doc-num').textContent || 'devis') + '.pdf');
  novaToast('PDF téléchargé');
}