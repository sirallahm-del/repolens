/* ==========================================================================
   CLIENTS — directory, add client, per-client devis/facture history
   TODO backend: replace NOVA.getClients()/addClient() with real API calls
   ========================================================================== */

let clientSearch = "";

function clientTotals(clientId){
  const devis = NOVA.getDevis().filter(d=>d.clientId===clientId);
  const factures = NOVA.getFactures().filter(f=>f.clientId===clientId);
  const totalFacture = factures.reduce((s,f)=>s+f.montant,0);
  return { devisCount: devis.length, facturesCount: factures.length, totalFacture, devis, factures };
}

function renderClients(){
  const clients = NOVA.getClients().filter(c=>{
    if(!clientSearch) return true;
    const q = clientSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q) || c.ice.toLowerCase().includes(q);
  });

  const wrap = document.getElementById("clientsWrap");
  if(clients.length === 0){
    wrap.innerHTML = `
      <div class="empty">
        <div class="glyph">${NOVA.icon("users",44)}</div>
        <h3>Aucun client trouvé.</h3>
        <p>Essaie une autre recherche, ou ajoute un nouveau client.</p>
        <button class="btn btn-primary" onclick="document.getElementById('openNewClient').click()">Nouveau client</button>
      </div>`;
    return;
  }

  wrap.innerHTML = `<div class="client-cards">
    ${clients.map(c=>{
      const stats = clientTotals(c.id);
      const initials = c.name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
      return `
      <div class="client-card" data-id="${c.id}">
        <div class="client-avatar">${initials}</div>
        <div class="row-title" style="font-size:15px;">${c.name}</div>
        <div class="row-sub">${c.city} · ICE ${c.ice}</div>
        <div class="row-sub mt-8">${c.contact}</div>
        <div class="client-stats">
          <div><b>${stats.devisCount}</b>Devis</div>
          <div><b>${stats.facturesCount}</b>Factures</div>
          <div><b>${NOVA.fmtMAD(stats.totalFacture).replace(" MAD","")}</b>MAD facturés</div>
        </div>
      </div>`;
    }).join("")}
  </div>`;
}

function openClientDetail(id){
  const client = NOVA.clientById(id);
  if(!client) return;
  const stats = clientTotals(id);
  const modal = document.getElementById("detailModal");
  document.getElementById("detailContent").innerHTML = `
    <span class="eyebrow">[ ${client.ice} ]</span>
    <h3 style="margin-bottom:4px;">${client.name}</h3>
    <p class="small">${client.contact} · ${client.email}</p>
    <p class="small mt-8">${client.city} · Client depuis ${NOVA.fmtDate(client.createdAt)}</p>

    <div class="mt-24">
      <div class="card-head"><h3 style="font-size:13px;">Devis (${stats.devis.length})</h3></div>
      ${stats.devis.slice(0,4).map(d=>`
        <div class="totals-row"><span>${d.ref}</span><span><span class="badge ${NOVA.DEVIS_STATUS_CLASS[d.status]}" style="margin-right:8px;">${NOVA.DEVIS_STATUS_LABEL[d.status]}</span>${NOVA.fmtMAD(d.montant)}</span></div>
      `).join("") || `<p class="small muted">Aucun devis.</p>`}
    </div>

    <div class="mt-24">
      <div class="card-head"><h3 style="font-size:13px;">Factures (${stats.factures.length})</h3></div>
      ${stats.factures.slice(0,4).map(f=>`
        <div class="totals-row"><span>${f.ref}</span><span><span class="badge ${NOVA.FAC_STATUS_CLASS[f.status]}" style="margin-right:8px;">${NOVA.FAC_STATUS_LABEL[f.status]}</span>${NOVA.fmtMAD(f.montant)}</span></div>
      `).join("") || `<p class="small muted">Aucune facture.</p>`}
    </div>

    <button class="btn mt-24" style="width:100%;" id="closeDetail">Fermer</button>
  `;
  modal.classList.add("open");
  document.getElementById("closeDetail").addEventListener("click", ()=> modal.classList.remove("open"));
}

document.addEventListener("DOMContentLoaded", ()=>{
  renderClients();

  document.getElementById("searchInput").addEventListener("input", (e)=>{
    clientSearch = e.target.value; renderClients();
  });

  document.getElementById("clientsWrap").addEventListener("click", (e)=>{
    const card = e.target.closest(".client-card");
    if(!card) return;
    openClientDetail(card.dataset.id);
  });

  const detailModal = document.getElementById("detailModal");
  detailModal.addEventListener("click", (e)=>{ if(e.target===detailModal) detailModal.classList.remove("open"); });

  const clientModal = document.getElementById("clientModal");
  document.getElementById("openNewClient").addEventListener("click", ()=>{
    document.getElementById("clientForm").reset();
    clientModal.classList.add("open");
  });
  document.getElementById("cancelClient").addEventListener("click", ()=> clientModal.classList.remove("open"));
  clientModal.addEventListener("click", (e)=>{ if(e.target===clientModal) clientModal.classList.remove("open"); });

  document.getElementById("clientForm").addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = document.getElementById("cName").value.trim();
    if(!name){ NOVA.toast("Le nom de l'entreprise est requis"); return; }
    NOVA.addClient({
      name,
      contact: document.getElementById("cContact").value.trim() || "—",
      ice: document.getElementById("cIce").value.trim() || "—",
      email: document.getElementById("cEmail").value.trim() || "—",
      phone: "—",
      city: document.getElementById("cCity").value,
    });
    clientModal.classList.remove("open");
    renderClients();
    NOVA.toast("✓ Client ajouté");
  });
});
