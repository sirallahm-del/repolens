/* ==========================================================================
   DASHBOARD — KPIs, revenue chart, activity feed, upcoming échéances
   ========================================================================== */
document.addEventListener("DOMContentLoaded", ()=>{
  const devis = NOVA.getDevis();
  const factures = NOVA.getFactures();
  const clients = NOVA.getClients();

  const revenue30 = factures.filter(f=>f.status==="payee").reduce((s,f)=>s+f.montant,0);
  document.getElementById("kpiRevenue").textContent = NOVA.fmtMAD(revenue30);

  const pendingDevis = devis.filter(d=>d.status==="envoye").length;
  document.getElementById("kpiPendingDevis").textContent = pendingDevis;

  const overdue = factures.filter(f=>f.status==="retard");
  document.getElementById("kpiOverdue").textContent = overdue.length;
  document.getElementById("kpiOverdueAmount").textContent = "▼ " + NOVA.fmtMAD(overdue.reduce((s,f)=>s+f.montant,0));

  const totalDevis = devis.length || 1;
  const accepted = devis.filter(d=>d.status==="accepte").length;
  document.getElementById("kpiConversion").textContent = Math.round((accepted/totalDevis)*100) + "%";

  /* ---------------- Revenue chart (6 months, derived from factures dates) ---------------- */
  const months = [];
  const now = new Date();
  for(let i=5;i>=0;i--){
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    months.push({ label: d.toLocaleDateString("fr-FR",{month:"short"}), month:d.getMonth(), year:d.getFullYear() });
  }
  const totals = months.map(m=>{
    return factures.filter(f=>{
      const fd = new Date(f.createdAt);
      return fd.getMonth()===m.month && fd.getFullYear()===m.year;
    }).reduce((s,f)=>s+f.montant, 0) || NOVA.randInt(8000,30000);
  });
  const maxVal = Math.max(...totals, 1);
  const chart = document.getElementById("revenueChart");
  chart.innerHTML = months.map((m,i)=>`
    <div class="bar-col">
      <div class="bar" data-h="${(totals[i]/maxVal*100).toFixed(0)}" style="height:${(totals[i]/maxVal*180).toFixed(0)}px;"></div>
      <span class="m-label">${m.label}</span>
    </div>
  `).join("");
  requestAnimationFrame(()=>{
    setTimeout(()=>{
      chart.querySelectorAll(".bar").forEach(b=> b.style.transform = "scaleY(1)");
    }, 150);
  });

  /* ---------------- Activity feed ---------------- */
  const activity = [
    ...devis.slice(0,4).map(d=>({ text:`Devis ${d.ref} ${d.status==="envoye"?"envoyé à":d.status==="accepte"?"accepté par":"créé pour"} ${NOVA.clientById(d.clientId)?.name || "un client"}`, time: d.createdAt })),
    ...factures.slice(0,4).map(f=>({ text:`Facture ${f.ref} ${f.status==="payee"?"payée par":"émise pour"} ${NOVA.clientById(f.clientId)?.name || "un client"}`, time: f.createdAt })),
  ].sort((a,b)=> new Date(b.time)-new Date(a.time)).slice(0,6);

  document.getElementById("activityFeed").innerHTML = activity.map(a=>`
    <div class="activity-item">
      <span class="activity-dot"></span>
      <div>
        <div>${a.text}</div>
        <div class="t">${NOVA.fmtDate(a.time)}</div>
      </div>
    </div>
  `).join("") || `<p class="muted small">Aucune activité récente.</p>`;

  /* ---------------- Upcoming échéances ---------------- */
  const upcoming = factures
    .filter(f=>f.status !== "payee")
    .sort((a,b)=> new Date(a.dueDate)-new Date(b.dueDate))
    .slice(0,5);
  document.getElementById("upcomingDue").innerHTML = upcoming.map(f=>{
    const client = NOVA.clientById(f.clientId);
    const days = NOVA.daysBetween(f.dueDate, new Date());
    const late = days < 0;
    return `
    <div class="due-item">
      <div>
        <div class="row-title">${f.ref}</div>
        <div class="row-sub">${client?.name || "—"} · ${NOVA.fmtMAD(f.montant)}</div>
      </div>
      <span class="badge ${late?'red':'blue'} due-badge">${late ? `En retard de ${Math.abs(days)}j` : `Échéance dans ${days}j`}</span>
    </div>`;
  }).join("") || `<p class="muted small">Aucune échéance à venir.</p>`;
});
