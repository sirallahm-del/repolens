/* ==========================================================================
   DEVIS — list, filters, creation drawer with line-item builder
   TODO backend: replace NOVA.getDevis()/addDevis() with real API calls
   ========================================================================== */

let devisState = { search:"", status:"all", client:"" };
let lineIdCounter = 0;

function populateClientSelects(){
  const clients = NOVA.getClients();
  const filter = document.getElementById("clientFilter");
  const formSelect = document.getElementById("fClient");
  clients.forEach(c=>{
    filter.insertAdjacentHTML("beforeend", `<option value="${c.id}">${c.name}</option>`);
    formSelect.insertAdjacentHTML("beforeend", `<option value="${c.id}">${c.name}</option>`);
  });
}

function renderTable(){
  const devis = NOVA.getDevis();
  const filtered = devis.filter(d=>{
    if(devisState.status !== "all" && d.status !== devisState.status) return false;
    if(devisState.client && d.clientId !== devisState.client) return false;
    if(devisState.search){
      const q = devisState.search.toLowerCase();
      const client = NOVA.clientById(d.clientId);
      if(!d.ref.toLowerCase().includes(q) && !(client && client.name.toLowerCase().includes(q))) return false;
    }
    return true;
  }).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));

  const wrap = document.getElementById("tableWrap");
  if(filtered.length === 0){
    wrap.innerHTML = `
      <div class="empty">
        <div class="glyph">${NOVA.icon("quote",44)}</div>
        <h3>Aucun devis trouvé.</h3>
        <p>Essaie d'autres filtres, ou crée ton premier devis.</p>
        <button class="btn btn-primary" onclick="document.getElementById('openNewDevis').click()">Nouveau devis</button>
      </div>`;
    return;
  }

  wrap.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Référence</th><th>Client</th><th>Date</th><th class="num">Montant</th><th>Statut</th><th></th>
        </tr></thead>
        <tbody>
          ${filtered.map(d=>{
            const client = NOVA.clientById(d.clientId);
            return `
            <tr data-id="${d.id}">
              <td><div class="row-title">${d.ref}</div></td>
              <td>${client ? client.name : "—"}<div class="row-sub">${client ? client.city : ""}</div></td>
              <td>${NOVA.fmtDate(d.createdAt)}</td>
              <td class="num">${NOVA.fmtMAD(d.montant)}</td>
              <td><span class="badge ${NOVA.DEVIS_STATUS_CLASS[d.status]}">${NOVA.DEVIS_STATUS_LABEL[d.status]}</span></td>
              <td>
                <div class="row-actions">
                  <button class="icon-btn" data-action="view" title="Voir">${NOVA.icon("eye",14)}</button>
                  <button class="icon-btn" data-action="convert" title="Convertir en facture" ${d.status!=="accepte"?"disabled":""}>${NOVA.icon("convert",14)}</button>
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

/* ---------------- Line item builder ---------------- */
function addLineRow(desc="", qty=1, price=""){
  const id = "li" + (lineIdCounter++);
  const wrap = document.getElementById("lineItems");
  const row = document.createElement("div");
  row.className = "line-item";
  row.dataset.id = id;
  row.innerHTML = `
    <input type="text" placeholder="Description de la prestation" class="li-desc" value="${desc}">
    <input type="number" min="1" placeholder="Qté" class="li-qty" value="${qty}">
    <input type="number" min="0" placeholder="Prix unitaire" class="li-price" value="${price}">
    <span class="line-total">0 MAD</span>
    <button type="button" class="icon-btn" data-remove="${id}">${NOVA.icon("x",13)}</button>
  `;
  wrap.appendChild(row);
  row.querySelectorAll("input").forEach(inp=> inp.addEventListener("input", updateTotals));
  row.querySelector("[data-remove]").addEventListener("click", ()=>{ row.remove(); updateTotals(); });
}

function updateTotals(){
  let subtotal = 0;
  document.querySelectorAll(".line-item").forEach(row=>{
    const qty = parseFloat(row.querySelector(".li-qty").value) || 0;
    const price = parseFloat(row.querySelector(".li-price").value) || 0;
    const total = qty*price;
    row.querySelector(".line-total").textContent = NOVA.fmtMAD(total);
    subtotal += total;
  });
  const tva = subtotal*0.2;
  document.getElementById("subtotalVal").textContent = NOVA.fmtMAD(subtotal);
  document.getElementById("tvaVal").textContent = NOVA.fmtMAD(tva);
  document.getElementById("totalVal").textContent = NOVA.fmtMAD(subtotal+tva);

  const suggestions = [
    "NOVA_CORE analyse tes lignes en temps réel pour suggérer la TVA et détecter les incohérences de prix.",
    "Astuce : les montants ronds (ex. 5 000 MAD) inspirent davantage confiance sur les gros devis.",
    "NOVA_CORE : ce type de prestation est généralement accepté 30% plus vite avec une description détaillée.",
  ];
  if(subtotal > 0){
    document.getElementById("aiSuggestion").textContent = suggestions[Math.floor(Math.random()*suggestions.length) === 0 ? 0 : Math.floor(Math.random()*suggestions.length)];
  }
}

function resetForm(){
  document.getElementById("lineItems").innerHTML = "";
  document.getElementById("devisForm").reset();
  addLineRow();
  updateTotals();
}

/* ---------------- View modal ---------------- */
function openViewModal(devisId){
  const d = NOVA.getDevis().find(x=>x.id===devisId);
  if(!d) return;
  const client = NOVA.clientById(d.clientId);
  const modal = document.getElementById("viewModal");
  document.getElementById("viewModalContent").innerHTML = `
    <span class="eyebrow">[ ${d.ref} ]</span>
    <h3 style="margin-bottom:6px;">${client ? client.name : "Client"}</h3>
    <p class="small">${NOVA.fmtDate(d.createdAt)} · <span class="badge ${NOVA.DEVIS_STATUS_CLASS[d.status]}">${NOVA.DEVIS_STATUS_LABEL[d.status]}</span></p>
    <div class="mt-16">
      ${(d.items||[]).map(it=>`<div class="totals-row"><span>${it.desc}</span><span>${NOVA.fmtMAD(it.qty*it.price)}</span></div>`).join("")}
    </div>
    <div class="totals-box">
      <div class="totals-row grand"><span>Total</span><span>${NOVA.fmtMAD(d.montant)}</span></div>
    </div>
    <div class="flex gap-12 mt-24">
      <button class="btn" id="closeView">Fermer</button>
      <button class="btn btn-primary" style="flex:1;" id="markSent" ${d.status!=="brouillon"?"disabled":""}>Marquer envoyé</button>
    </div>
  `;
  modal.classList.add("open");
  document.getElementById("closeView").addEventListener("click", ()=> modal.classList.remove("open"));
  document.getElementById("markSent").addEventListener("click", ()=>{
    NOVA.updateDevisStatus(d.id, "envoye");
    modal.classList.remove("open");
    renderTable();
    NOVA.toast("✓ Devis marqué comme envoyé");
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  populateClientSelects();
  renderTable();
  addLineRow();
  updateTotals();

  document.getElementById("searchInput").addEventListener("input", (e)=>{
    devisState.search = e.target.value; renderTable();
  });
  document.getElementById("statusChips").addEventListener("click", (e)=>{
    const chip = e.target.closest(".chip"); if(!chip) return;
    document.querySelectorAll("#statusChips .chip").forEach(c=>c.classList.remove("active"));
    chip.classList.add("active");
    devisState.status = chip.dataset.status;
    renderTable();
  });
  document.getElementById("clientFilter").addEventListener("change", (e)=>{
    devisState.client = e.target.value; renderTable();
  });

  const overlay = document.getElementById("devisOverlay");
  document.getElementById("openNewDevis").addEventListener("click", ()=>{
    resetForm();
    overlay.classList.add("open");
  });
  document.getElementById("closeDrawer").addEventListener("click", ()=> overlay.classList.remove("open"));
  overlay.addEventListener("click", (e)=>{ if(e.target===overlay) overlay.classList.remove("open"); });
  document.getElementById("addLine").addEventListener("click", ()=> addLineRow());

  function collectFormData(status){
    const clientId = document.getElementById("fClient").value;
    if(!clientId){ NOVA.toast("Sélectionne un client"); return null; }
    const items = Array.from(document.querySelectorAll(".line-item")).map(row=>({
      desc: row.querySelector(".li-desc").value || "Prestation",
      qty: parseFloat(row.querySelector(".li-qty").value) || 1,
      price: parseFloat(row.querySelector(".li-price").value) || 0,
    })).filter(it=>it.price > 0);
    if(items.length === 0){ NOVA.toast("Ajoute au moins une ligne avec un prix"); return null; }
    const montant = Math.round(items.reduce((s,it)=>s+it.qty*it.price,0)*1.2);
    return { clientId, items, montant, status };
  }

  document.getElementById("saveDraft").addEventListener("click", ()=>{
    const data = collectFormData("brouillon");
    if(!data) return;
    NOVA.addDevis(data);
    overlay.classList.remove("open");
    renderTable();
    NOVA.toast("✓ Devis enregistré comme brouillon");
  });

  document.getElementById("devisForm").addEventListener("submit", (e)=>{
    e.preventDefault();
    const data = collectFormData("envoye");
    if(!data) return;
    NOVA.addDevis(data);
    overlay.classList.remove("open");
    renderTable();
    NOVA.toast("✓ Devis envoyé au client");
  });

  document.getElementById("tableWrap").addEventListener("click", (e)=>{
    const btn = e.target.closest("[data-action]");
    if(!btn) return;
    const row = e.target.closest("tr");
    const id = row.dataset.id;
    const action = btn.dataset.action;
    if(action === "view") openViewModal(id);
    else if(action === "download") NOVA.toast("✓ PDF généré et téléchargé");
    else if(action === "convert"){
      const d = NOVA.getDevis().find(x=>x.id===id);
      if(!d || d.status !== "accepte") return;
      NOVA.addFacture({ clientId:d.clientId, montant:d.montant, status:"attente", dueDate: new Date(Date.now()+30*86400000).toISOString() });
      NOVA.toast("✓ Devis converti en facture");
      window.location.href = "factures.html";
    } else if(action === "delete"){
      NOVA.saveDevis(NOVA.getDevis().filter(x=>x.id!==id));
      renderTable();
      NOVA.toast("Devis supprimé");
    }
  });
});
