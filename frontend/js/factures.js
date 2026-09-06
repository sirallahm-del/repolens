/* ==========================================================================
   FACTURES — list, KPIs, payment tracking, creation form
   TODO backend: replace NOVA.getFactures()/addFacture() with real API calls
   ========================================================================== */

let factureState = { search:"", status:"all", client:"" };

function populateClientSelectsFac(){
  const clients = NOVA.getClients();
  const filter = document.getElementById("clientFilter");
  const formSelect = document.getElementById("fClient");
  clients.forEach(c=>{
    filter.insertAdjacentHTML("beforeend", `<option value="${c.id}">${c.name}</option>`);
    formSelect.insertAdjacentHTML("beforeend", `<option value="${c.id}">${c.name}</option>`);
  });
}

function renderKpis(){
  const factures = NOVA.getFactures();
  const total = factures.reduce((s,f)=>s+f.montant,0);
  const attente = factures.filter(f=>f.status==="attente");
  const retard = factures.filter(f=>f.status==="retard");
  const now = new Date();
  const paidThisMonth = factures.filter(f=>{
    if(f.status!=="payee") return false;
    const d = new Date(f.createdAt);
    return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  }).reduce((s,f)=>s+f.montant,0);

  document.getElementById("kpiTotal").textContent = NOVA.fmtMAD(total);
  document.getElementById("kpiAttente").textContent = attente.length;
  document.getElementById("kpiRetard").textContent = retard.length;
  document.getElementById("kpiPaid").textContent = NOVA.fmtMAD(paidThisMonth);
}

function renderTable(){
  const factures = NOVA.getFactures();
  const filtered = factures.filter(f=>{
    if(factureState.status !== "all" && f.status !== factureState.status) return false;
    if(factureState.client && f.clientId !== factureState.client) return false;
    if(factureState.search){
      const q = factureState.search.toLowerCase();
      const client = NOVA.clientById(f.clientId);
      if(!f.ref.toLowerCase().includes(q) && !(client && client.name.toLowerCase().includes(q))) return false;
    }
    return true;
  }).sort((a,b)=> new Date(a.dueDate)-new Date(b.dueDate));

  const wrap = document.getElementById("tableWrap");
  if(filtered.length === 0){
    wrap.innerHTML = `
      <div class="empty">
        <div class="glyph">${NOVA.icon("invoice",44)}</div>
        <h3>Aucune facture trouvée.</h3>
        <p>Essaie d'autres filtres, ou crée ta première facture.</p>
        <button class="btn btn-primary" onclick="document.getElementById('openNewFacture').click()">Nouvelle facture</button>
      </div>`;
    return;
  }

  wrap.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Référence</th><th>Client</th><th>Échéance</th><th class="num">Montant</th><th>Statut</th><th></th>
        </tr></thead>
        <tbody>
          ${filtered.map(f=>{
            const client = NOVA.clientById(f.clientId);
            const days = NOVA.daysBetween(f.dueDate, new Date());
            const late = f.status === "retard";
            return `
            <tr data-id="${f.id}">
              <td><div class="row-title">${f.ref}</div></td>
              <td>${client ? client.name : "—"}<div class="row-sub">${client ? client.city : ""}</div></td>
              <td>${NOVA.fmtDate(f.dueDate)}${late ? `<div class="row-sub" style="color:var(--red);">En retard de ${Math.abs(days)}j</div>` : ""}</td>
              <td class="num">${NOVA.fmtMAD(f.montant)}</td>
              <td><span class="badge ${NOVA.FAC_STATUS_CLASS[f.status]}">${NOVA.FAC_STATUS_LABEL[f.status]}</span></td>
              <td>
                <div class="row-actions">
                  <button class="icon-btn" data-action="paid" title="Marquer payée" ${f.status==="payee"?"disabled":""}>${NOVA.icon("check",14)}</button>
                  <button class="icon-btn" data-action="remind" title="Relancer" ${f.status==="payee"?"disabled":""}>${NOVA.icon("edit",14)}</button>
                  <button class="icon-btn" data-action="download" title="Télécharger PDF">${NOVA.icon("download",14)}</button>
                  <button class="icon-btn" data-action="delete" title="Supprimer">${NOVA.icon("trash",14)}</button>
                </div>
              </td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderAll(){ renderKpis(); renderTable(); }

document.addEventListener("DOMContentLoaded", ()=>{
  populateClientSelectsFac();
  renderAll();

  document.getElementById("searchInput").addEventListener("input", (e)=>{
    factureState.search = e.target.value; renderTable();
  });
  document.getElementById("statusChips").addEventListener("click", (e)=>{
    const chip = e.target.closest(".chip"); if(!chip) return;
    document.querySelectorAll("#statusChips .chip").forEach(c=>c.classList.remove("active"));
    chip.classList.add("active");
    factureState.status = chip.dataset.status;
    renderTable();
  });
  document.getElementById("clientFilter").addEventListener("change", (e)=>{
    factureState.client = e.target.value; renderTable();
  });

  const overlay = document.getElementById("factureOverlay");
  document.getElementById("openNewFacture").addEventListener("click", ()=>{
    document.getElementById("factureForm").reset();
    const in30 = new Date(Date.now()+30*86400000).toISOString().slice(0,10);
    document.getElementById("fDue").value = in30;
    overlay.classList.add("open");
  });
  document.getElementById("closeDrawer").addEventListener("click", ()=> overlay.classList.remove("open"));
  overlay.addEventListener("click", (e)=>{ if(e.target===overlay) overlay.classList.remove("open"); });

  document.getElementById("factureForm").addEventListener("submit", (e)=>{
    e.preventDefault();
    const clientId = document.getElementById("fClient").value;
    const montant = parseFloat(document.getElementById("fMontant").value);
    const dueDate = new Date(document.getElementById("fDue").value).toISOString();
    if(!clientId || !montant){ NOVA.toast("Complète le client et le montant"); return; }
    NOVA.addFacture({ clientId, montant, dueDate, status:"attente" });
    overlay.classList.remove("open");
    renderAll();
    NOVA.toast("✓ Facture créée");
  });

  document.getElementById("tableWrap").addEventListener("click", (e)=>{
    const btn = e.target.closest("[data-action]");
    if(!btn) return;
    const row = e.target.closest("tr");
    const id = row.dataset.id;
    const action = btn.dataset.action;
    if(action === "paid"){
      NOVA.updateFactureStatus(id, "payee");
      renderAll();
      NOVA.toast("✓ Facture marquée payée");
    } else if(action === "remind"){
      NOVA.toast("✓ Relance envoyée au client");
    } else if(action === "download"){
      NOVA.toast("✓ PDF généré et téléchargé");
    } else if(action === "delete"){
      NOVA.saveFactures(NOVA.getFactures().filter(x=>x.id!==id));
      renderAll();
      NOVA.toast("Facture supprimée");
    }
  });
});
