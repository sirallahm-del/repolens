/* =========================================================
   NOVA — Mock data layer
   Everything is generated once, then persisted to localStorage
   so actions survive across page navigations in the session.
   ========================================================= */

const NOVA_SEED = {
  company: {
    name: "Atlas Climatisation",
    ice: "0021458796000045",
    if: "45872103",
    phone: "+212 6 61 22 33 44",
    address: "12 Rue Al Amal, Casablanca",
    currency: "DH",
    tva: 20
  },

  clients: [
    { id: "c1", name: "Ahmed Benali", phone: "+212 6 12 34 56 78", email: "ahmed.benali@gmail.com", type: "Particulier", createdAt: "2025-11-02" },
    { id: "c2", name: "Yassine Idrissi", phone: "+212 6 98 76 54 32", email: "y.idrissi@outlook.com", type: "Particulier", createdAt: "2025-11-14" },
    { id: "c3", name: "Sara Fassi", phone: "+212 6 55 44 33 22", email: "sara.fassi@gmail.com", type: "Particulier", createdAt: "2025-12-01" },
    { id: "c4", name: "Riad Al Manar", phone: "+212 5 22 11 22 33", email: "contact@riadalmanar.ma", type: "Entreprise", createdAt: "2025-12-08" },
    { id: "c5", name: "Karim Ouazzani", phone: "+212 6 44 55 66 77", email: "k.ouazzani@gmail.com", type: "Particulier", createdAt: "2025-12-20" },
    { id: "c6", name: "Fatima Zahra Alaoui", phone: "+212 6 33 22 11 00", email: "fz.alaoui@gmail.com", type: "Particulier", createdAt: "2026-01-05" },
    { id: "c7", name: "Pharmacie Al Cheffa", phone: "+212 5 22 98 76 54", email: "pharmacie.cheffa@gmail.com", type: "Entreprise", createdAt: "2026-01-18" },
    { id: "c8", name: "Omar Sekkat", phone: "+212 6 21 43 65 87", email: "omar.sekkat@gmail.com", type: "Particulier", createdAt: "2026-02-02" },
    { id: "c9", name: "Résidence Anfa Park", phone: "+212 5 22 45 67 89", email: "syndic@anfapark.ma", type: "Entreprise", createdAt: "2026-02-19" },
    { id: "c10", name: "Nawal Berrada", phone: "+212 6 87 65 43 21", email: "nawal.berrada@gmail.com", type: "Particulier", createdAt: "2026-03-03" },
    { id: "c11", name: "Café Renaissance", phone: "+212 5 22 33 44 55", email: "cafe.renaissance@gmail.com", type: "Entreprise", createdAt: "2026-03-21" },
    { id: "c12", name: "Hicham Tazi", phone: "+212 6 11 22 33 44", email: "hicham.tazi@gmail.com", type: "Particulier", createdAt: "2026-04-10" }
  ],

  products: [
    { id: "p1", name: "Climatiseur 12000 BTU", price: 3500, tva: 20, category: "Équipement", stock: 12 },
    { id: "p2", name: "Climatiseur 18000 BTU", price: 5200, tva: 20, category: "Équipement", stock: 7 },
    { id: "p3", name: "Main d'œuvre installation", price: 900, tva: 20, category: "Service", stock: null },
    { id: "p4", name: "Maintenance annuelle", price: 450, tva: 20, category: "Service", stock: null },
    { id: "p5", name: "Recharge gaz R410A", price: 380, tva: 20, category: "Consommable", stock: 34 },
    { id: "p6", name: "Support mural climatiseur", price: 220, tva: 20, category: "Accessoire", stock: 20 },
    { id: "p7", name: "Nettoyage filtre + désinfection", price: 250, tva: 20, category: "Service", stock: null },
    { id: "p8", name: "Câblage électrique dédié", price: 400, tva: 20, category: "Service", stock: null },
    { id: "p9", name: "Climatiseur Gainable 24000 BTU", price: 9800, tva: 20, category: "Équipement", stock: 3 },
    { id: "p10", name: "Contrat entretien annuel Pro", price: 1800, tva: 20, category: "Service", stock: null }
  ],

  devis: [
    { id: "DEV-2026-024", clientId: "c1", date: "2026-09-03", status: "Envoyé", items: [
      { name: "Climatiseur 12000 BTU", qty: 3, price: 3500 }, { name: "Main d'œuvre installation", qty: 1, price: 900 } ] },
    { id: "DEV-2026-023", clientId: "c4", date: "2026-09-01", status: "Accepté", items: [
      { name: "Climatiseur Gainable 24000 BTU", qty: 2, price: 9800 }, { name: "Câblage électrique dédié", qty: 2, price: 400 } ] },
    { id: "DEV-2026-022", clientId: "c2", date: "2026-08-29", status: "Brouillon", items: [
      { name: "Climatiseur 18000 BTU", qty: 1, price: 5200 } ] },
    { id: "DEV-2026-021", clientId: "c7", date: "2026-08-27", status: "Envoyé", items: [
      { name: "Climatiseur 12000 BTU", qty: 2, price: 3500 }, { name: "Support mural climatiseur", qty: 2, price: 220 } ] },
    { id: "DEV-2026-020", clientId: "c9", date: "2026-08-24", status: "Refusé", items: [
      { name: "Contrat entretien annuel Pro", qty: 6, price: 1800 } ] },
    { id: "DEV-2026-019", clientId: "c5", date: "2026-08-20", status: "Accepté", items: [
      { name: "Climatiseur 12000 BTU", qty: 1, price: 3500 }, { name: "Main d'œuvre installation", qty: 1, price: 900 } ] },
    { id: "DEV-2026-018", clientId: "c3", date: "2026-08-18", status: "Expiré", items: [
      { name: "Recharge gaz R410A", qty: 2, price: 380 } ] },
    { id: "DEV-2026-017", clientId: "c8", date: "2026-08-14", status: "Envoyé", items: [
      { name: "Climatiseur 18000 BTU", qty: 2, price: 5200 }, { name: "Main d'œuvre installation", qty: 2, price: 900 } ] },
    { id: "DEV-2026-016", clientId: "c11", date: "2026-08-10", status: "Accepté", items: [
      { name: "Climatiseur 12000 BTU", qty: 4, price: 3500 }, { name: "Support mural climatiseur", qty: 4, price: 220 } ] },
    { id: "DEV-2026-015", clientId: "c6", date: "2026-08-06", status: "Brouillon", items: [
      { name: "Nettoyage filtre + désinfection", qty: 3, price: 250 } ] },
    { id: "DEV-2026-014", clientId: "c10", date: "2026-08-02", status: "Envoyé", items: [
      { name: "Climatiseur 12000 BTU", qty: 1, price: 3500 } ] },
    { id: "DEV-2026-013", clientId: "c12", date: "2026-07-28", status: "Accepté", items: [
      { name: "Maintenance annuelle", qty: 1, price: 450 }, { name: "Recharge gaz R410A", qty: 1, price: 380 } ] },
    { id: "DEV-2026-012", clientId: "c1", date: "2026-07-22", status: "Expiré", items: [
      { name: "Climatiseur 18000 BTU", qty: 1, price: 5200 } ] },
    { id: "DEV-2026-011", clientId: "c4", date: "2026-07-15", status: "Accepté", items: [
      { name: "Contrat entretien annuel Pro", qty: 3, price: 1800 } ] },
    { id: "DEV-2026-010", clientId: "c2", date: "2026-07-09", status: "Refusé", items: [
      { name: "Climatiseur Gainable 24000 BTU", qty: 1, price: 9800 } ] }
  ],

  factures: [
    { id: "FAC-024", clientId: "c1", date: "2026-09-03", status: "Payée", items: [
      { name: "Climatiseur 12000 BTU", qty: 3, price: 3500 }, { name: "Main d'œuvre installation", qty: 1, price: 900 } ] },
    { id: "FAC-023", clientId: "c2", date: "2026-09-02", status: "En attente", items: [
      { name: "Climatiseur 18000 BTU", qty: 1, price: 5200 } ] },
    { id: "FAC-022", clientId: "c3", date: "2026-09-01", status: "En retard", items: [
      { name: "Recharge gaz R410A", qty: 2, price: 380 } ] },
    { id: "FAC-021", clientId: "c4", date: "2026-08-29", status: "Payée", items: [
      { name: "Climatiseur Gainable 24000 BTU", qty: 2, price: 9800 } ] },
    { id: "FAC-020", clientId: "c5", date: "2026-08-26", status: "Payée", items: [
      { name: "Climatiseur 12000 BTU", qty: 1, price: 3500 }, { name: "Main d'œuvre installation", qty: 1, price: 900 } ] },
    { id: "FAC-019", clientId: "c6", date: "2026-08-23", status: "En retard", items: [
      { name: "Nettoyage filtre + désinfection", qty: 3, price: 250 } ] },
    { id: "FAC-018", clientId: "c7", date: "2026-08-19", status: "Payée", items: [
      { name: "Climatiseur 12000 BTU", qty: 2, price: 3500 } ] },
    { id: "FAC-017", clientId: "c8", date: "2026-08-16", status: "En attente", items: [
      { name: "Climatiseur 18000 BTU", qty: 2, price: 5200 } ] },
    { id: "FAC-016", clientId: "c9", date: "2026-08-12", status: "Payée", items: [
      { name: "Contrat entretien annuel Pro", qty: 6, price: 1800 } ] },
    { id: "FAC-015", clientId: "c10", date: "2026-08-08", status: "Payée", items: [
      { name: "Climatiseur 12000 BTU", qty: 1, price: 3500 } ] },
    { id: "FAC-014", clientId: "c11", date: "2026-08-04", status: "En retard", items: [
      { name: "Climatiseur 12000 BTU", qty: 4, price: 3500 } ] },
    { id: "FAC-013", clientId: "c12", date: "2026-07-30", status: "Payée", items: [
      { name: "Maintenance annuelle", qty: 1, price: 450 } ] },
    { id: "FAC-012", clientId: "c1", date: "2026-07-25", status: "Payée", items: [
      { name: "Climatiseur 18000 BTU", qty: 1, price: 5200 } ] },
    { id: "FAC-011", clientId: "c4", date: "2026-07-19", status: "Payée", items: [
      { name: "Contrat entretien annuel Pro", qty: 3, price: 1800 } ] },
    { id: "FAC-010", clientId: "c2", date: "2026-07-12", status: "En attente", items: [
      { name: "Climatiseur Gainable 24000 BTU", qty: 1, price: 9800 } ] }
  ],

  expenses: [
    { id: "e1", supplier: "Frigo Maroc SARL", category: "Matériel", amount: 12400, date: "2026-08-28" },
    { id: "e2", supplier: "Total Energies", category: "Carburant", amount: 850, date: "2026-08-25" },
    { id: "e3", supplier: "Électro Pièces Casa", category: "Matériel", amount: 3200, date: "2026-08-20" },
    { id: "e4", supplier: "IAM Business", category: "Télécom", amount: 399, date: "2026-08-15" },
    { id: "e5", supplier: "Assurance Atlas", category: "Assurance", amount: 2100, date: "2026-08-05" }
  ],

  appointments: [
    { time: "09:00", label: "Installation", client: "Ahmed Benali", day: "today" },
    { time: "11:30", label: "Maintenance", client: "Sara Fassi", day: "today" },
    { time: "15:00", label: "Devis sur site", client: "Yassine Idrissi", day: "today" },
    { time: "09:30", label: "Réparation", client: "Karim Ouazzani", day: "tomorrow" },
    { time: "14:00", label: "Installation", client: "Résidence Anfa Park", day: "tomorrow" }
  ]
};

const NOVA = {
  fmt(n){ return Math.round(n).toLocaleString('fr-FR') + ' ' + this.data().company.currency; },
  fmtNum(n){ return Math.round(n).toLocaleString('fr-FR'); },

  data(){
    if(!localStorage.getItem('nova_data')){
      localStorage.setItem('nova_data', JSON.stringify(NOVA_SEED));
    }
    return JSON.parse(localStorage.getItem('nova_data'));
  },
  save(d){ localStorage.setItem('nova_data', JSON.stringify(d)); },

  client(id){ return this.data().clients.find(c => c.id === id); },

  lineTotal(item){ return item.qty * item.price; },
  docTotals(items){
    const sub = items.reduce((s,i) => s + this.lineTotal(i), 0);
    const tva = sub * (this.data().company.tva/100);
    return { sub, tva, total: sub + tva };
  },

  addDevis(devis){
    const d = this.data();
    d.devis.unshift(devis);
    this.save(d);
  },
  addFacture(fac){
    const d = this.data();
    d.factures.unshift(fac);
    this.save(d);
  },
  addClient(client){
    const d = this.data();
    d.clients.unshift(client);
    this.save(d);
  },
  updateFactureStatus(id, status){
    const d = this.data();
    const f = d.factures.find(x => x.id === id);
    if(f) f.status = status;
    this.save(d);
  },
  convertDevisToFacture(devisId){
    const d = this.data();
    const dv = d.devis.find(x => x.id === devisId);
    if(!dv) return null;
    const nums = d.factures.map(f => parseInt(f.id.split('-')[1])).filter(n=>!isNaN(n));
    const nextNum = (nums.length ? Math.max(...nums) : 0) + 1;
    const fac = { id: 'FAC-' + String(nextNum).padStart(3,'0'), clientId: dv.clientId, date: new Date().toISOString().slice(0,10), status: 'En attente', items: dv.items };
    d.factures.unshift(fac);
    dv.status = 'Accepté';
    this.save(d);
    return fac;
  },

  kpis(){
    const d = this.data();
    const revenue = d.factures.filter(f=>f.status==='Payée').reduce((s,f)=>s+this.docTotals(f.items).total,0);
    const unpaid = d.factures.filter(f=>f.status!=='Payée').reduce((s,f)=>s+this.docTotals(f.items).total,0);
    return {
      revenue,
      devisCount: d.devis.length,
      facturesCount: d.factures.length,
      unpaid
    };
  },

  // Naive NL -> line items parser for the AI simulation.
  parseDescription(text){
    const items = [];
    const t = text.toLowerCase();
    const patterns = [
      { re: /(\d+)?\s*climatiseurs?\s*(\d{4,5})?\s*btu.{0,20}?(\d[\d.,]*)\s*dh/i, build:(m)=>({ name:`Climatiseur${m[2]?' '+m[2]+' BTU':''}`, qty: m[1]?parseInt(m[1]):1, price: parseFloat(m[3].replace(/[.,]/g,'')) }) },
      { re: /main\s*d.?œ?uvre.{0,15}?(\d[\d.,]*)\s*dh/i, build:(m)=>({ name:'Main d\'œuvre', qty:1, price: parseFloat(m[1].replace(/[.,]/g,'')) }) },
      { re: /(\d+)?\s*support[s]?\s*mural.{0,15}?(\d[\d.,]*)\s*dh/i, build:(m)=>({ name:'Support mural', qty:m[1]?parseInt(m[1]):1, price: parseFloat(m[2].replace(/[.,]/g,'')) }) }
    ];
    patterns.forEach(p => { const m = t.match(p.re); if(m) items.push(p.build(m)); });
    if(items.length === 0){
      // graceful fallback demo data so the AI moment always feels alive
      items.push({ name: 'Climatiseur 12000 BTU', qty: 3, price: 3500 });
      items.push({ name: "Main d'œuvre", qty: 1, price: 900 });
    }
    return items;
  }
};
