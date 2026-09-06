document.addEventListener('DOMContentLoaded', () => {
  const d = NOVA.data();
  const kpis = NOVA.kpis();

  const todayLabel = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' });
  document.getElementById('topbar-date').textContent = todayLabel;

  novaCountUp(document.getElementById('kpi-revenue'), kpis.revenue, { money:true, duration:1000 });
  novaCountUp(document.getElementById('kpi-devis'), kpis.devisCount, { duration:700 });
  novaCountUp(document.getElementById('kpi-factures'), kpis.facturesCount, { duration:700 });
  novaCountUp(document.getElementById('kpi-unpaid'), kpis.unpaid, { money:true, duration:1000 });
  document.getElementById('unpaid-inline').textContent = NOVA.fmt(kpis.unpaid);

  // Revenue bars (mock 7-month trend, last bar = real total)
  const months = ['Mar','Avr','Mai','Jun','Jul','Aoû','Sep'];
  const base = kpis.revenue;
  const values = [0.55, 0.62, 0.71, 0.68, 0.8, 0.9, 1].map(f => base * f * (0.5 + Math.random()*0.15 + 0.4));
  const max = Math.max(...values);
  const barsEl = document.getElementById('revenue-bars');
  barsEl.innerHTML = values.map((v,i) => `
    <div class="bar-col">
      <div class="bar ${i===values.length-1?'hi':''}" style="height:0%" data-h="${Math.max(6,(v/max*100))}%" title="${months[i]} : ${NOVA.fmt(v)}"></div>
      <div class="bar-lbl">${months[i]}</div>
    </div>`).join('');
  requestAnimationFrame(() => {
    setTimeout(() => {
      barsEl.querySelectorAll('.bar').forEach(b => b.style.height = b.dataset.h);
    }, 80);
  });

  // Recent documents (latest 5 factures)
  const tbody = document.querySelector('#recent-table tbody');
  const statusClass = { 'Payée':'paid', 'En attente':'pending', 'En retard':'overdue' };
  tbody.innerHTML = d.factures.slice(0,5).map(f => {
    const c = NOVA.client(f.clientId);
    const total = NOVA.docTotals(f.items).total;
    return `<tr>
      <td class="cell-primary">${f.id}</td>
      <td>${c ? c.name : '—'}</td>
      <td class="cell-muted">${novaDateShort(f.date)}</td>
      <td class="cell-num">${NOVA.fmt(total)}</td>
      <td><span class="status ${statusClass[f.status]}">${f.status}</span></td>
    </tr>`;
  }).join('');

  novaRenderDonut(d);
  novaRenderAppointments(d);
  novaRenderTopClients(d);

  novaIcons();
});

function novaDateShort(iso){
  const [y,m,day] = iso.split('-');
  return `${day}/${m}`;
}

// ---------- Revenue-by-category donut ----------
function novaRenderDonut(d){
  const byCategory = {};
  let total = 0;
  d.factures.forEach(f => {
    f.items.forEach(item => {
      const product = d.products.find(p => p.name === item.name);
      const cat = product ? product.category : 'Autre';
      const amount = item.qty * item.price;
      byCategory[cat] = (byCategory[cat] || 0) + amount;
      total += amount;
    });
  });

  const sorted = Object.entries(byCategory).sort((a,b) => b[1]-a[1]);
  const top = sorted.slice(0,3);
  const restTotal = sorted.slice(3).reduce((s,[,v]) => s+v, 0);
  if(restTotal > 0) top.push(['Autres', restTotal]);

  const shades = ['var(--accent)', '#8B7FE8', '#BDB5F2', 'var(--border-strong)'];
  let acc = 0;
  const stops = top.map(([name, val], i) => {
    const pct = total ? (val/total*100) : 0;
    const start = acc; acc += pct;
    return `${shades[i]} ${start}% ${acc}%`;
  });
  document.getElementById('donut-ring').style.background = total
    ? `conic-gradient(${stops.join(', ')})`
    : 'var(--border)';

  if(top.length){
    const [leadName, leadVal] = top[0];
    document.getElementById('donut-center-val').textContent = total ? Math.round(leadVal/total*100)+'%' : '—';
    document.getElementById('donut-center-lbl').textContent = leadName;
  }

  document.getElementById('donut-legend').innerHTML = top.map(([name, val], i) => `
    <div class="dl-row">
      <span class="dl-dot" style="background:${shades[i]}"></span>
      <span class="dl-name">${name}</span>
      <span class="dl-pct">${total ? Math.round(val/total*100) : 0}%</span>
    </div>`).join('');
}

// ---------- Today's appointments ----------
function novaRenderAppointments(d){
  const today = d.appointments.filter(a => a.day === 'today').slice(0,3);
  const list = document.getElementById('appt-list');
  list.innerHTML = today.map(a => `
    <div class="mini-row">
      <div class="mr-icon"><i data-lucide="calendar"></i></div>
      <div class="mr-main">
        <div class="mr-title">${a.label}</div>
        <div class="mr-sub">${a.client}</div>
      </div>
      <div class="mr-value">${a.time}</div>
    </div>`).join('') || `<div class="empty-state" style="padding:20px 0;">Aucun rendez-vous aujourd'hui</div>`;
}

// ---------- Top clients by revenue ----------
function novaRenderTopClients(d){
  const totals = {};
  d.factures.forEach(f => {
    const t = NOVA.docTotals(f.items).total;
    totals[f.clientId] = (totals[f.clientId] || 0) + t;
  });
  const top = Object.entries(totals).sort((a,b) => b[1]-a[1]).slice(0,3);
  const list = document.getElementById('top-clients-list');
  list.innerHTML = top.map(([clientId, total]) => {
    const c = NOVA.client(clientId);
    const initials = c ? c.name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase() : '—';
    return `<div class="mini-row" style="cursor:pointer" onclick="location.href='clients.html'">
      <div class="avatar" style="width:30px;height:30px;font-size:11px;">${initials}</div>
      <div class="mr-main">
        <div class="mr-title">${c ? c.name : '—'}</div>
      </div>
      <div class="mr-value">${NOVA.fmt(total)}</div>
    </div>`;
  }).join('') || `<div class="empty-state" style="padding:20px 0;">Aucune donnée</div>`;
}

function novaShowAnalysis(){
  document.getElementById('ai-insight-panel').scrollIntoView({ behavior:'smooth', block:'center' });
  novaToast('Analyse NOVA AI mise à jour');
}