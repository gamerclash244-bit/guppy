// Tournament engine + UI wiring
// Saves to localStorage key: 'uhhss_tourney_v1'
// Admin password default: 'tournament' (change inside code if needed)

const STORAGE_KEY = 'uhhss_tourney_v1';
const ADMIN_PASSWORD = 'Nizal@2009';

// Default data (4 groups x 4 teams)
const defaultData = {
  groups: [
    { name: 'Group A', teams: ['Brazil','Switzerland','Serbia','Cameroon'] },
    { name: 'Group B', teams: ['Netherlands','Ecuador','Senegal','Qatar'] },
    { name: 'Group C', teams: ['Argentina','Saudi Arabia','Mexico','Poland'] },
    { name: 'Group D', teams: ['France','Australia','Denmark','Tunisia'] }
  ],
  scores: {} // keys: G{g}_M{m} -> {a: number|null, b: number|null}
};

let data = loadData();
let editMode = false;

// DOM refs
const groupsGrid = document.getElementById('groupsGrid');
const fixturesContainer = document.getElementById('fixturesContainer');
const standingsContainer = document.getElementById('standingsContainer');
const bracketEl = document.getElementById('bracket');

const adminOpenBtn = document.getElementById('adminOpenBtn');
const adminModal = document.getElementById('adminModal');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const demoLogin = document.getElementById('demoLogin');
const closeAdmin = document.getElementById('closeAdmin');
const adminPassInput = document.getElementById('adminPass');
const adminControls = document.getElementById('adminControls');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');

const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');

// init
renderAll();

// ---------- storage ----------
function loadData(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return JSON.parse(JSON.stringify(defaultData));
}
function saveData(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ---------- render ----------
function renderAll(){
  renderGroups();
  renderFixtures();
  renderStandingsAll();
  renderBracket();
}

// Groups cards (with edit fields when in admin)
function renderGroups(){
  groupsGrid.innerHTML = '';
  data.groups.forEach((g,gi) => {
    const card = document.createElement('div'); card.className = 'group-card';
    const title = document.createElement('h2'); title.textContent = g.name;
    card.appendChild(title);

    const ol = document.createElement('ol');

    g.teams.forEach((team,ti) => {
      const li = document.createElement('li');
      if(editMode){
        const inp = document.createElement('input');
        inp.value = team;
        inp.style.width = '100%';
        inp.style.padding = '6px';
        inp.style.borderRadius = '8px';
        inp.style.border = '1px solid rgba(0,0,0,0.06)';
        inp.addEventListener('input', () => {
          data.groups[gi].teams[ti] = inp.value || 'Team';
          updateAllAfterEdit();
        });
        li.appendChild(inp);
      } else {
        li.textContent = team;
      }
      ol.appendChild(li);
    });

    card.appendChild(ol);
    groupsGrid.appendChild(card);
  });
}

// Fixtures: For each group, list generated pair matches (single round-robin)
function generateGroupFixtures(teams){
  const t = teams.slice();
  const pairs = [];
  for(let i=0;i<t.length;i++){
    for(let j=i+1;j<t.length;j++){
      pairs.push({a:t[i], b:t[j]});
    }
  }
  return pairs;
}

function renderFixtures(){
  fixturesContainer.innerHTML = '';
  data.groups.forEach((g,gi) => {
    const section = document.createElement('div');
    section.style.marginBottom = '12px';

    const head = document.createElement('div');
    head.style.display='flex'; head.style.justifyContent='space-between'; head.style.alignItems='center'; head.style.margin='8px 0';
    const h = document.createElement('strong'); h.textContent = g.name;
    head.appendChild(h);
    section.appendChild(head);

    const pairs = generateGroupFixtures(g.teams);
    pairs.forEach((p,mi) => {
      const fid = `G${gi}_M${mi}`;
      const sc = data.scores[fid] || {a:null,b:null};

      const fx = document.createElement('div'); fx.className='fixture';

      const teamsDiv = document.createElement('div'); teamsDiv.className='teams';
      const left = document.createElement('div'); left.className='team-name'; left.textContent = p.a;
      const right = document.createElement('div'); right.className='team-name'; right.style.textAlign='right'; right.textContent = p.b;
      teamsDiv.appendChild(left);
      teamsDiv.appendChild(right);

      const scoreDiv = document.createElement('div'); scoreDiv.className='score';
      const inA = document.createElement('input'); inA.type='number'; inA.min=0; inA.value = sc.a===null||sc.a===undefined?'':sc.a;
      const inB = document.createElement('input'); inB.type='number'; inB.min=0; inB.value = sc.b===null||sc.b===undefined?'':sc.b;
      inA.disabled = !editMode; inB.disabled = !editMode;

      inA.addEventListener('change', () => {
        data.scores[fid] = data.scores[fid] || {};
        data.scores[fid].a = parseScore(inA.value);
        updateAllAfterEdit();
      });
      inB.addEventListener('change', () => {
        data.scores[fid] = data.scores[fid] || {};
        data.scores[fid].b = parseScore(inB.value);
        updateAllAfterEdit();
      });

      scoreDiv.appendChild(inA);
      scoreDiv.appendChild(document.createTextNode('  —  '));
      scoreDiv.appendChild(inB);

      fx.appendChild(teamsDiv);
      fx.appendChild(scoreDiv);
      section.appendChild(fx);
    });

    fixturesContainer.appendChild(section);
  });
}

// Standings: compute per group
function parseScore(v){ const n = parseInt(v); return Number.isFinite(n)?n:null; }

function computeStandingsForGroup(g, gi){
  // initialize
  const stats = {};
  g.teams.forEach(t => stats[t] = {team:t, mp:0, w:0, d:0, l:0, gf:0, ga:0, gd:0, pts:0});

  const pairs = generateGroupFixtures(g.teams);
  pairs.forEach((p,mi) => {
    const key = `G${gi}_M${mi}`;
    const sc = data.scores[key];
    if(!sc || sc.a===null || sc.b===null) return;
    const A = stats[p.a], B = stats[p.b];
    A.mp++; B.mp++;
    A.gf += sc.a; A.ga += sc.b;
    B.gf += sc.b; B.ga += sc.a;
    if(sc.a > sc.b){ A.w++; B.l++; A.pts += 3; }
    else if(sc.a < sc.b){ B.w++; A.l++; B.pts += 3; }
    else { A.d++; B.d++; A.pts += 1; B.pts += 1; }
  });

  Object.values(stats).forEach(s => s.gd = s.gf - s.ga);

  const arr = Object.values(stats).sort((x,y) => {
    if(y.pts !== x.pts) return y.pts - x.pts;
    if(y.gd !== x.gd) return y.gd - x.gd;
    if(y.gf !== x.gf) return y.gf - x.gf;
    return x.team.localeCompare(y.team);
  });

  arr.forEach((s,i) => s.pos = i+1);
  return arr;
}

function renderStandingsAll(){
  standingsContainer.innerHTML = '';
  data.groups.forEach((g,gi) => {
    const card = document.createElement('div');
    card.style.marginBottom = '12px';
    const title = document.createElement('strong'); title.textContent = g.name;
    card.appendChild(title);

    const table = document.createElement('table'); table.className = 'table';
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Pos</th><th>Team</th><th>MP</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');

    const st = computeStandingsForGroup(g, gi);
    st.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td style="width:34px">${s.pos}</td>
        <td>${escapeHtml(s.team)}</td>
        <td>${s.mp}</td><td>${s.w}</td><td>${s.d}</td><td>${s.l}</td>
        <td>${s.gf}</td><td>${s.ga}</td><td>${s.gd}</td><td><strong>${s.pts}</strong></td>`;
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    card.appendChild(table);
    standingsContainer.appendChild(card);
  });
}

// Bracket: top 2 from each group -> Quarterfinals mapping (A1 vs B2, C1 vs D2, B1 vs A2, D1 vs C2)
function qualifiedTeams(){
  const q = [];
  data.groups.forEach((g,gi) => {
    const st = computeStandingsForGroup(g, gi);
    for(let i=0;i<2 && i<st.length;i++) q.push({team:st[i].team, group:gi+1, pos:i+1});
  });
  return q;
}

function buildBracket(){
  const q = qualifiedTeams();
  if(q.length < 8) return null;
  const pick = (g,p) => {
    const found = q.find(x => x.group === g && x.pos === p);
    return found ? found.team : 'TBD';
  };
  const rounds = [];
  const qf = [
    {teamA: pick(1,1), teamB: pick(2,2), scoreA:null, scoreB:null, winner:null},
    {teamA: pick(3,1), teamB: pick(4,2), scoreA:null, scoreB:null, winner:null},
    {teamA: pick(2,1), teamB: pick(1,2), scoreA:null, scoreB:null, winner:null},
    {teamA: pick(4,1), teamB: pick(3,2), scoreA:null, scoreB:null, winner:null}
  ];
  rounds.push(qf);
  rounds.push([{teamA:'TBD',teamB:'TBD',scoreA:null,scoreB:null,winner:null},{teamA:'TBD',teamB:'TBD',scoreA:null,scoreB:null,winner:null}]);
  rounds.push([{teamA:'TBD',teamB:'TBD',scoreA:null,scoreB:null,winner:null}]);
  return rounds;
}

function renderBracket(){
  bracketEl.innerHTML = '';
  const rounds = buildBracket();
  if(!rounds){
    bracketEl.innerHTML = '<div class="muted">Not enough qualified teams yet (needs 8).</div>'; return;
  }
  rounds.forEach((r,ri) => {
    const col = document.createElement('div'); col.className = 'round';
    col.innerHTML = `<div style="font-weight:700;margin-bottom:8px">${ri===0?'Quarterfinals':ri===1?'Semifinals':'Final'}</div>`;
    r.forEach((m,mi) => {
      const box = document.createElement('div'); box.className = 'match';
      const teamsDiv = document.createElement('div'); teamsDiv.style.display='flex'; teamsDiv.style.justifyContent='space-between'; teamsDiv.style.alignItems='center';
      const left = document.createElement('div'); left.style.flex='1'; left.textContent = m.teamA;
      const right = document.createElement('div'); right.style.flex='1'; right.style.textAlign='right'; right.textContent = m.teamB;
      const scoreWrapper = document.createElement('div'); scoreWrapper.style.minWidth='88px'; scoreWrapper.style.textAlign='center';
      // show scores only for QF and only in admin (optional)
      if(editMode && ri===0){
        const sa = document.createElement('input'); sa.type='number'; sa.min=0; sa.style.width='40px';
        const sb = document.createElement('input'); sb.type='number'; sb.min=0; sb.style.width='40px';
        sa.value = m.scoreA ?? '';
        sb.value = m.scoreB ?? '';
        sa.addEventListener('change', ()=> { m.scoreA = parseScore(sa.value); propagateKnockResults(rounds); renderBracket(); });
        sb.addEventListener('change', ()=> { m.scoreB = parseScore(sb.value); propagateKnockResults(rounds); renderBracket(); });
        scoreWrapper.appendChild(sa); scoreWrapper.appendChild(document.createTextNode(' — ')); scoreWrapper.appendChild(sb);
      } else {
        scoreWrapper.className = 'muted';
        scoreWrapper.textContent = '';
      }
      teamsDiv.appendChild(left);
      teamsDiv.appendChild(scoreWrapper);
      teamsDiv.appendChild(right);
      box.appendChild(teamsDiv);
      const w = document.createElement('div'); w.className='muted'; w.style.marginTop='6px';
      const winner = m.winner || (m.scoreA!=null && m.scoreB!=null ? (m.scoreA>m.scoreB?m.teamA:(m.scoreB>m.scoreA?m.teamB:'Tie')) : '');
      w.textContent = winner ? `Winner: ${winner}` : '';
      box.appendChild(w);
      col.appendChild(box);
    });
    bracketEl.appendChild(col);
  });
}

function propagateKnockResults(rounds){
  for(let ri=0; ri<rounds.length-1; ri++){
    rounds[ri].forEach((m,mi) => {
      if(m.scoreA==null || m.scoreB==null){ m.winner = null; return; }
      if(m.scoreA > m.scoreB) m.winner = m.teamA;
      else if(m.scoreB > m.scoreA) m.winner = m.teamB;
      else m.winner = m.teamA + ' (tie)';
      const nextIdx = Math.floor(mi/2);
      const side = (mi % 2 === 0) ? 'teamA' : 'teamB';
      rounds[ri+1][nextIdx][side] = m.winner;
    });
  }
}

// ---------- helpers ----------
function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// Recompute & re-render helpers
function updateAllAfterEdit(){
  renderStandingsAll();
  renderFixtures();
  renderBracket();
  saveData();
}

// ---------- admin modal & edit mode ----------
adminOpenBtn.addEventListener('click', () => {
  adminModal.classList.remove('hidden');
  adminModal.setAttribute('aria-hidden','false');
  adminPassInput.value = '';
  adminControls.classList.add('hidden');
});

closeAdmin.addEventListener('click', closeModal);
function closeModal(){
  adminModal.classList.add('hidden');
  adminModal.setAttribute('aria-hidden','true');
}

demoLogin.addEventListener('click', () => {
  enterAdminMode(true);
});

adminLoginBtn.addEventListener('click', () => {
  const val = adminPassInput.value || '';
  if(val === ADMIN_PASSWORD){
    enterAdminMode(false);
  } else {
    alert('Incorrect password.');
  }
});

function enterAdminMode(isDemo){
  editMode = true;
  adminControls.classList.remove('hidden');
  // show admin-specific UI
  document.querySelectorAll('.fixture input[type="number"]').forEach(inp => inp.disabled = false);
  renderGroups();
  renderFixtures();
  renderStandingsAll();
  renderBracket();
  // show Save/Cancel handlers
  saveBtn.addEventListener('click', () => {
    editMode = false;
    saveData();
    document.querySelectorAll('.fixture input[type="number"]').forEach(inp => inp.disabled = true);
    adminControls.classList.add('hidden');
    closeModal();
    renderAll();
    alert('Saved.');
  }, { once: true });

  cancelBtn.addEventListener('click', () => {
    data = loadData(true);
    editMode = false;
    document.querySelectorAll('.fixture input[type="number"]').forEach(inp => inp.disabled = true);
    adminControls.classList.add('hidden');
    closeModal();
    renderAll();
  }, { once: true });
}

// ---------- misc actions ----------
resetBtn.addEventListener('click', () => {
  if(confirm('Reset tournament to defaults?')) {
    data = JSON.parse(JSON.stringify(defaultData));
    saveData();
    renderAll();
  }
});

exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'uhhss_tourney.json';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

// Close modal on backdrop click
adminModal.addEventListener('click', (e) => {
  if(e.target === adminModal || e.target.classList.contains('modal-backdrop')) closeModal();
});

// On load: make minor entrance animations
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.group-card').forEach((el, idx) => {
    el.style.transitionDelay = (idx*80)+'ms';
    el.style.transform = 'translateY(0)';
  });
});