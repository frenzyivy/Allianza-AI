// ==================== DASHBOARD APP ====================
'use strict';

// ---- THEME ----
const html = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
const themeThumb = document.getElementById('themeThumb');
const moonSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const sunSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
let isDark = true;
themeBtn.addEventListener('click', () => {
    isDark = !isDark;
    html.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeThumb.innerHTML = isDark ? sunSVG : moonSVG;
    // Re-render charts with new colors
    setTimeout(() => { destroyCharts(); renderChartsForPage(currentPage); }, 350);
});
themeThumb.innerHTML = sunSVG;

// ---- HELPERS ----
const $ = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);
const getAccent = () => getComputedStyle(html).getPropertyValue('--accent').trim();
const getColor = v => getComputedStyle(html).getPropertyValue(v).trim();
const H = (strings, ...vals) => strings.reduce((a, s, i) => a + s + (vals[i] ?? ''), '');

function badge(type, text) {
    const map = { Active: 'badge-green', Trial: 'badge-yellow', Churned: 'badge-red', Pro: 'badge-accent', Starter: 'badge-grey', Scale: 'badge-gold', Urgent: 'badge-red', Normal: 'badge-yellow', Low: 'badge-grey', Online: 'badge-green', Away: 'badge-yellow', Offline: 'badge-grey' };
    return `<span class="badge ${map[text] || 'badge-grey'}">${text}</span>`;
}
function healthBar(score) {
    const color = score >= 80 ? '#2ecc71' : score >= 60 ? '#e67e22' : '#e74c3c';
    return `<div class="health-score"><div class="health-bar"><div class="health-fill" style="width:${score}%;background:${color}"></div></div>${score}%</div>`;
}
function marginColor(m) { return m > 0 ? 'color:var(--green)' : 'color:var(--red)'; }
function fmt(n) { return '$' + n.toLocaleString(); }

// ---- NAVIGATION ----
const pages = ['overview', 'clients', 'ai-monitor', 'financials', 'api-connections', 'my-team', 'alerts', 'settings'];
const pageTitles = { overview: 'Overview', clients: 'Clients', 'ai-monitor': 'AI Monitor', financials: 'Financials', 'api-connections': 'API Connections', 'my-team': 'My Team', alerts: 'Alerts', settings: 'Settings' };
let currentPage = 'overview';
let chartsMap = {};

function navigateTo(page, tabId) {
    pages.forEach(p => {
        const el = $('page-' + p);
        if (el) el.classList.toggle('active', p === page);
    });
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.page === page && !tabId);
        if (el.dataset.page === page) el.classList.add('active');
    });
    $('navTitle').textContent = pageTitles[page] || page;
    currentPage = page;
    destroyCharts();
    renderChartsForPage(page);
    if (tabId) setTimeout(() => switchTab(page, tabId), 50);
}

// Sidebar click
document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.addEventListener('click', () => {
        const page = el.dataset.page;
        const sub = el.dataset.sub;
        const tab = el.dataset.tab;
        if (sub) {
            const subEl = $(sub);
            if (subEl) subEl.classList.toggle('open');
        }
        navigateTo(page, tab);
        // highlight active
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        el.classList.add('active');
    });
});

// Tab switching
function switchTab(pageId, tabId) {
    const page = $('page-' + pageId);
    if (!page) return;
    page.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    page.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === tabId));
    destroyCharts();
    renderChartsForPage(pageId, tabId);
}
document.querySelectorAll('.tab-bar').forEach(bar => {
    bar.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.closest('.page');
            if (!parent) return;
            const pid = parent.id.replace('page-', '');
            switchTab(pid, btn.dataset.tab);
        });
    });
});

// ---- CHART MANAGEMENT ----
function destroyCharts() {
    Object.values(chartsMap).forEach(c => { try { c.destroy(); } catch (e) { } });
    chartsMap = {};
}
function mkChart(id, cfg) {
    const el = $(id);
    if (!el) return;
    if (chartsMap[id]) { chartsMap[id].destroy(); }
    chartsMap[id] = new Chart(el, cfg);
}

function renderChartsForPage(page, tab) {
    const accent = getAccent();
    const muted = getColor('--text-muted');
    const border = getColor('--border');
    const surface2 = getColor('--surface-2');
    const gridOpts = { color: border };
    const tickOpts = { color: muted, font: { family: 'DM Sans', size: 11 } };
    const pluginOpts = { legend: { display: false }, tooltip: { backgroundColor: getColor('--surface'), titleColor: getColor('--text'), bodyColor: muted, borderColor: border, borderWidth: 1 } };

    if (page === 'overview') {
        const labels = Array.from({ length: 30 }, (_, i) => { const d = new Date; d.setDate(d.getDate() - 29 + i); return d.getDate() + '/' + (d.getMonth() + 1); });
        mkChart('queryChart', { type: 'line', data: { labels, datasets: [{ data: DATA.financials.queryData, borderColor: accent, backgroundColor: accent + '22', fill: true, tension: 0.4, pointRadius: 2, pointHoverRadius: 5 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: pluginOpts, scales: { x: { grid: gridOpts, ticks: { ...tickOpts, maxTicksLimit: 8 } }, y: { grid: gridOpts, ticks: tickOpts } } } });
        const hData = [3, 1, 1]; // healthy, warning, critical
        mkChart('healthDonut', { type: 'doughnut', data: { datasets: [{ data: hData, backgroundColor: ['#2ecc71', '#e67e22', '#e74c3c'], borderWidth: 0, hoverOffset: 6 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false }, tooltip: pluginOpts.tooltip } } });
    }
    if (page === 'financials' && (!tab || tab === 'tab-pl')) {
        mkChart('momChart', { type: 'bar', data: { labels: DATA.financials.momLabels, datasets: [{ label: 'Revenue', data: DATA.financials.momRevenue, backgroundColor: accent + '99', borderRadius: 6 }, { label: 'Costs', data: DATA.financials.momCosts, backgroundColor: muted + '55', borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: pluginOpts, scales: { x: { grid: { display: false }, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts } } } });
        mkChart('revCostChart', { type: 'line', data: { labels: DATA.financials.momLabels, datasets: [{ label: 'Revenue', data: DATA.financials.momRevenue, borderColor: accent, backgroundColor: 'transparent', tension: 0.4 }, { label: 'Costs', data: DATA.financials.momCosts, borderColor: '#e67e22', backgroundColor: 'transparent', tension: 0.4, borderDash: [5, 5] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { ...pluginOpts, legend: { display: true, labels: { color: getColor('--text'), font: { family: 'DM Sans', size: 11 } } } }, scales: { x: { grid: { display: false }, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts } } } });
    }
    if (page === 'financials' && tab === 'tab-api-costs') {
        const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
        const colors = [accent, '#e67e22', '#3498db', '#9b59b6', '#1abc9c'];
        mkChart('clientCostChart', { type: 'bar', data: { labels: months, datasets: DATA.clients.map((c, i) => ({ label: c.name, data: Array.from({ length: 6 }, (_, j) => Math.round(c.apiCost * (0.6 + j * 0.1))), backgroundColor: colors[i % colors.length] + '99', borderRadius: 4 })) }, options: { responsive: true, maintainAspectRatio: false, plugins: { ...pluginOpts, legend: { display: true, labels: { color: getColor('--text'), font: { family: 'DM Sans', size: 10 }, boxWidth: 12 } } }, scales: { x: { stacked: true, grid: { display: false }, ticks: tickOpts }, y: { stacked: true, grid: gridOpts, ticks: tickOpts } } } });
        mkChart('cpqChart', { type: 'line', data: { labels: months, datasets: [{ data: [0.024, 0.021, 0.019, 0.018, 0.017, 0.016], borderColor: accent, tension: 0.4, pointRadius: 3, fill: false }] }, options: { responsive: true, maintainAspectRatio: false, plugins: pluginOpts, scales: { x: { grid: { display: false }, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: v => '$' + v.toFixed(3) } } } } });
    }
    if (page === 'financials' && tab === 'tab-revenue') {
        const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
        mkChart('mrrChart', { type: 'line', data: { labels: months, datasets: [{ data: DATA.financials.mrr, borderColor: accent, backgroundColor: accent + '22', fill: true, tension: 0.4, pointRadius: 3 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: pluginOpts, scales: { x: { grid: { display: false }, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: v => '$' + v.toLocaleString() } } } } });
        mkChart('planDonut', { type: 'doughnut', data: { datasets: [{ data: [49 * 2, 99 * 3, 199 * 1], backgroundColor: ['#8a7070', accent, '#f1c40f'], borderWidth: 0, hoverOffset: 6 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => { const labels = ['Starter', 'Pro', 'Scale']; return labels[ctx.dataIndex] + ': $' + ctx.raw; } } } } } });
        renderPlanLegend();
    }
}

function renderPlanLegend() {
    const el = $('planLegend');
    if (!el) return;
    const items = [{ label: 'Starter', color: '#8a7070', val: '$98/mo' }, { label: 'Pro', color: getAccent(), val: '$297/mo' }, { label: 'Scale', color: '#f1c40f', val: '$199/mo' }];
    el.innerHTML = items.map(i => `<div class="legend-item"><div class="legend-dot" style="background:${i.color}"></div><div><div style="font-weight:600;font-size:.82rem">${i.label}</div><div style="font-size:.75rem;color:var(--text-muted)">${i.val}</div></div></div>`).join('');
}

// ---- OVERVIEW PAGE ----
function renderOverview() {
    const f = DATA.financials;
    const gp = f.revenue - f.apiCosts - f.callCosts - f.infra - f.trialCosts;
    const np = gp - f.salaries;
    const kpis = [
        { label: 'Total Active Clients', value: '5', change: '+2 this month', up: true, icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
        { label: 'MRR This Month', value: '$6,200', change: '+$600 vs Feb', up: true, icon: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' },
        { label: 'API Cost Today', value: '$28', change: '$840 projected', up: false, icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' },
        { label: 'Net Profit (March)', value: fmt(np), change: (np > 0 ? '+' : '') + Math.round(np / f.revenue * 100) + '% margin', up: np > 0, icon: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>' },
    ];
    $('overviewKPIs').innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${k.icon}</svg></div>
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value font-display">${k.value}</div>
      <div class="kpi-change ${k.up ? 'up' : 'down'}">${k.up ? '▲' : '▼'} ${k.change}</div>
    </div>`).join('');

    $('healthRows').innerHTML = [
        { label: 'Healthy', dot: 'green', count: 3 }, { label: 'Warning', dot: 'yellow', count: 1 }, { label: 'Critical', dot: 'red', count: 1 }
    ].map(r => `<div class="health-row"><div class="health-row-left"><div class="dot dot-${r.dot}"></div>${r.label}</div><strong>${r.count}</strong></div>`).join('');
    $('healthLegend').innerHTML = [
        { label: 'Healthy (3)', color: '#2ecc71' }, { label: 'Warning (1)', color: '#e67e22' }, { label: 'Critical (1)', color: '#e74c3c' }
    ].map(i => `<div class="legend-item"><div class="legend-dot" style="background:${i.color}"></div>${i.label}</div>`).join('');

    $('recentSignups').innerHTML = DATA.clients.slice().reverse().slice(0, 5).map(c => `
    <div class="list-row">
      <div class="list-row-left"><div class="client-avatar">${c.initials}</div><div><div class="client-name">${c.name}</div><div class="client-email">${c.joined}</div></div></div>
      ${badge('', c.plan)} ${badge('', c.status)}
    </div>`).join('');

    $('activeTrials').innerHTML = DATA.clients.filter(c => c.status === 'Trial').map(c => `
    <div class="trial-row">
      <div class="trial-header"><span class="trial-name">${c.name}</span><span class="trial-days ${c.daysLeft <= 3 ? 'urgent' : ''}">${c.daysLeft} days left</span></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${(c.daysLeft / 14) * 100}%;background:${c.daysLeft <= 3 ? 'var(--red)' : 'var(--accent)'}"></div></div>
    </div>`).join('') || '<div style="color:var(--text-muted);font-size:.83rem;padding:1rem 0">No active trials</div>';

    $('alertsFeed').innerHTML = DATA.alerts.slice(0, 5).map(a => `
    <div class="alert-row">
      <div class="alert-icon">${a.icon}</div>
      <div class="alert-msg"><strong>${a.title}</strong> — ${a.msg}</div>
      <div class="alert-time">${a.time}</div>
    </div>`).join('');
}

// ---- CLIENTS PAGE ----
function renderClients() {
    renderClientsTable(DATA.clients);
    renderKanban();
    renderClientDetail(DATA.clients[0]);
}
function renderClientsTable(clients) {
    $('clientsTbody').innerHTML = clients.map(c => {
        const margin = Math.round((c.revenue - c.apiCost) / (c.revenue || 1) * 100);
        return `<tr>
      <td><div class="client-cell"><div class="client-avatar">${c.initials}</div><div><div class="client-name">${c.name}</div><div class="client-email">${c.email}</div></div></div></td>
      <td>${badge('', c.plan)}</td><td>${badge('', c.status)}</td>
      <td>${c.props}</td><td>${c.queries.toLocaleString()}</td>
      <td>${fmt(c.apiCost)}</td><td>${c.revenue ? fmt(c.revenue) : '—'}</td>
      <td style="${marginColor(margin)};font-weight:700">${c.revenue ? margin + '%' : 'N/A'}</td>
      <td>${healthBar(c.health)}</td>
      <td><div class="action-btns"><button class="act-btn primary" onclick="viewClient(${c.id})">View</button><button class="act-btn">Edit</button></div></td>
    </tr>`;
    }).join('');
    // Pagination
    $('clientsPagination').innerHTML = [1, 2, 3].map(n => `<button class="page-btn${n === 1 ? ' active' : ''}">${n}</button>`).join('');
    // Search
    $('clientSearch').oninput = e => {
        const q = e.target.value.toLowerCase();
        renderClientsTable(DATA.clients.filter(c => c.name.toLowerCase().includes(q) || c.plan.toLowerCase().includes(q)));
    };
}
window.viewClient = function (id) {
    const c = DATA.clients.find(x => x.id === id);
    if (!c) return;
    renderClientDetail(c);
    switchTab('clients', 'tab-detail');
    document.querySelector('[data-page="clients"][data-tab="tab-detail"]')?.classList.add('active');
};
function renderClientDetail(c) {
    const margin = Math.round((c.revenue - c.apiCost) / (c.revenue || 1) * 100);
    const ints = c.integrations || {};
    $('clientDetail').innerHTML = `
    <div class="detail-left">
      <div class="card card-sm">
        <div class="detail-avatar">${c.initials}</div>
        <div class="detail-client-name">${c.name}</div>
        ${badge('', c.plan)} ${badge('', c.status)}
        <div class="detail-meta">
          <div class="detail-meta-row"><span>Email</span><span>${c.email}</span></div>
          <div class="detail-meta-row"><span>Joined</span><span>${c.joined}</span></div>
          <div class="detail-meta-row"><span>Properties</span><span>${c.props}</span></div>
          <div class="detail-meta-row"><span>Assigned</span><span>${c.assigned}</span></div>
        </div>
      </div>
      <div class="card card-sm">
        <div class="card-title card-title-sm">Integration Status</div>
        <div class="integration-row">
          ${Object.entries(ints).map(([k, v]) => `<div class="integration-chip"><span>${v ? '✅' : '❌'}</span>${k}</div>`).join('')}
        </div>
      </div>
      <div class="card card-sm">
        <div class="card-title card-title-sm">Notes</div>
        <textarea style="width:100%;min-height:80px;resize:vertical" placeholder="Add notes about this client…"></textarea>
      </div>
    </div>
    <div class="detail-right">
      <div class="row-3" style="margin-bottom:0;gap:1rem">
        <div class="kpi-card"><div class="kpi-label">API Cost (Mar)</div><div class="kpi-value font-display">${fmt(c.apiCost)}</div></div>
        <div class="kpi-card"><div class="kpi-label">Revenue</div><div class="kpi-value font-display">${c.revenue ? fmt(c.revenue) : '—'}</div></div>
        <div class="kpi-card"><div class="kpi-label">Margin</div><div class="kpi-value font-display" style="${marginColor(margin)}">${c.revenue ? margin + '%' : 'N/A'}</div></div>
      </div>
      <div class="card"><div class="card-title">API Usage — March (per day)</div><div class="chart-wrap" style="height:180px"><canvas id="clientUsageChart"></canvas></div></div>
      <div class="card"><div class="card-title">Recent Conversations</div>
        ${DATA.liveConvos.slice(0, 3).map(l => `<div class="list-row"><div class="list-row-left"><span style="font-size:1rem">💬</span><div><div style="font-weight:600;font-size:.83rem">${l.channel} · ${l.time}</div><div style="font-size:.78rem;color:var(--text-muted)">${l.msg}</div></div></div></div>`).join('')}
      </div>
    </div>`;
    setTimeout(() => {
        const acc = getAccent(), muted = getColor('--text-muted'), brd = getColor('--border');
        const days = Array.from({ length: 30 }, (_, i) => i + 1);
        mkChart('clientUsageChart', { type: 'bar', data: { labels: days, datasets: [{ data: Array.from({ length: 30 }, () => Math.floor(Math.random() * c.queries / 20 + 5)), backgroundColor: acc + '88', borderRadius: 3 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: getColor('--surface'), titleColor: getColor('--text'), bodyColor: muted, borderColor: brd, borderWidth: 1 } }, scales: { x: { grid: { display: false }, ticks: { color: muted, font: { size: 10 }, maxTicksLimit: 10 } }, y: { grid: { color: brd }, ticks: { color: muted, font: { size: 10 } } } } } });
    }, 50);
}
function renderKanban() {
    $('kanbanBoard').innerHTML = Object.entries(DATA.kanban).map(([col, cards]) => `
    <div class="kanban-col">
      <div class="kanban-col-header">${col}<span class="kanban-count">${cards.length}</span></div>
      <div class="kanban-cards" id="col-${col.replace(/\s/g, '_')}">
        ${cards.map(c => `<div class="kanban-card" draggable="true">
          <div class="kanban-card-name"><div class="client-avatar" style="width:26px;height:26px;display:inline-flex;font-size:.6rem">${c.initials}</div> ${c.name}</div>
          ${c.days > 0 ? `<div class="kanban-card-days ${c.days > 5 ? 'over' : ''}">${c.days} days in stage</div>` : '<div class="kanban-card-days" style="color:var(--green)">Just moved in</div>'}
          <div class="kanban-card-footer"><span class="badge badge-grey" style="font-size:.65rem">${c.member}</span></div>
        </div>`).join('')}
      </div>
    </div>`).join('');
}

// ---- AI MONITOR ----
function renderAiMonitor() {
    $('aiKPIs').innerHTML = [
        { label: 'Total AI Instances', value: '8', change: 'across all clients', up: true },
        { label: 'Online', value: '6', change: 'running smoothly', up: true },
        { label: 'Offline', value: '1', change: 'Jessica P. — Prop 3', up: false },
        { label: 'Errors', value: '1', change: 'action required', up: false },
    ].map(k => `<div class="kpi-card"><div class="kpi-label">${k.label}</div><div class="kpi-value font-display">${k.value}</div><div class="kpi-change ${k.up ? 'up' : 'down'}">${k.change}</div></div>`).join('');

    const instances = [
        ...DATA.clients.flatMap(c => Array.from({ length: c.props }, (_, i) => ({ prop: `${c.name} — Prop ${i + 1}`, client: c.name, status: c.id === 3 && i === 2 ? 'Error' : i === 0 ? 'Online' : 'Online', queries: Math.floor(c.queries / c.props), esc: Math.round(Math.random() * 18), lastActive: '2 min ago', trained: 'Feb 28', gaps: i === 0 ? ['Late checkout rules'] : [] }))),
    ].slice(0, 6);

    $('aiGrid').innerHTML = instances.map(inst => `
    <div class="ai-card">
      <div class="ai-card-header">
        <div><div class="ai-prop">${inst.prop}</div><div class="ai-client">${inst.client}</div></div>
        <div class="pulse pulse-${inst.status === 'Online' ? 'green' : inst.status === 'Error' ? 'red' : 'grey'}"></div>
      </div>
      <div class="ai-stats">
        <div class="ai-stat"><div class="ai-stat-label">Queries Today</div><div class="ai-stat-val font-display">${inst.queries}</div></div>
        <div class="ai-stat"><div class="ai-stat-label">Escalation %</div><div class="ai-stat-val font-display" style="${inst.esc > 15 ? 'color:var(--red)' : ''}">${inst.esc}%</div></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:.72rem;color:var(--text-muted);margin-bottom:.75rem">
        <span>Last active: ${inst.lastActive}</span><span>Trained: ${inst.trained}</span>
      </div>
      ${inst.gaps.length ? `<div style="margin-bottom:.75rem">${inst.gaps.map(g => `<span class="ai-tag warn">⚠️ ${g}</span>`).join(' ')}</div>` : ''}
      <div class="ai-actions">
        <button class="act-btn">View Logs</button><button class="act-btn">Retrain</button>
        ${inst.status !== 'Online' ? '<button class="act-btn primary">Restart</button>' : ''}
      </div>
    </div>`).join('');

    // Live feed toggle
    let feedInterval = null;
    $('liveFeedToggle').addEventListener('click', function () {
        this.classList.toggle('on');
        if (this.classList.contains('on')) {
            renderLiveFeed();
            feedInterval = setInterval(addLiveFeedItem, 4000);
        } else {
            clearInterval(feedInterval);
            $('liveFeedRows').innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted);font-size:.85rem">Enable live feed to see real-time conversations</div>';
        }
    });
}
function renderLiveFeed() {
    $('liveFeedRows').innerHTML = DATA.liveConvos.map(l => `
    <div class="live-feed-row">
      <div class="feed-badge"><span class="badge badge-accent" style="font-size:.65rem">${l.channel}</span></div>
      <div class="feed-content">
        <div class="feed-header"><strong>${l.client}</strong></div>
        <div class="feed-msg">Guest: ${l.msg}</div>
        <div class="feed-response">AI: ${l.ai}</div>
      </div>
      <div class="feed-time">${l.time}</div>
    </div>`).join('');
}
function addLiveFeedItem() {
    const convo = DATA.liveConvos[Math.floor(Math.random() * DATA.liveConvos.length)];
    const row = document.createElement('div');
    row.className = 'live-feed-row';
    row.innerHTML = `<div class="feed-badge"><span class="badge badge-accent" style="font-size:.65rem">${convo.channel}</span></div><div class="feed-content"><div class="feed-header"><strong>${convo.client}</strong></div><div class="feed-msg">Guest: ${convo.msg}</div><div class="feed-response">AI: ${convo.ai}</div></div><div class="feed-time">Just now</div>`;
    const container = $('liveFeedRows');
    container.insertBefore(row, container.firstChild);
    if (container.children.length > 10) container.removeChild(container.lastChild);
}

// ---- FINANCIALS ----
function renderFinancials() {
    const f = DATA.financials;
    const totalRev = f.revenue + f.setupFees;
    const totalCosts = f.apiCosts + f.callCosts + f.infra + f.trialCosts;
    const gp = totalRev - totalCosts;
    const np = gp - f.salaries;
    const tax = Math.round(np * f.taxRate / 100);
    const postTax = np - tax;

    $('plCard').innerHTML = `
    <div class="pl-header"><h3>📊 AllianzaAI — P&L Dashboard · March 2025</h3></div>
    <div class="pl-body">
      <div class="pl-section">
        <div class="pl-section-title">💰 Revenue In</div>
        <div class="pl-row sub"><span>Subscription Revenue</span><span class="pl-value">${fmt(f.revenue)}</span></div>
        <div class="pl-row sub"><span>Setup / Onboarding Fees</span><span class="pl-value">${fmt(f.setupFees)}</span></div>
        <div class="pl-row total"><span>Total Revenue</span><span class="pl-value">${fmt(totalRev)}</span></div>
      </div>
      <div class="pl-section">
        <div class="pl-section-title">📤 Direct Costs</div>
        <div class="pl-row sub"><span>API Costs (OpenAI / Anthropic)</span><span class="pl-value">${fmt(f.apiCosts)}</span></div>
        <div class="pl-row sub"><span>Call / Voice API (Twilio)</span><span class="pl-value">${fmt(f.callCosts)}</span></div>
        <div class="pl-row sub"><span>Infrastructure / Hosting</span><span class="pl-value">${fmt(f.infra)}</span></div>
        <div class="pl-row sub"><span>Trial Costs Absorbed</span><span class="pl-value">${fmt(f.trialCosts)}</span></div>
        <div class="pl-row total"><span>Total Direct Costs</span><span class="pl-value">${fmt(totalCosts)}</span></div>
      </div>
      <div class="pl-section">
        <div class="pl-row profit"><span>Gross Profit</span><span class="pl-value">${fmt(gp)}<span class="pl-pct">${Math.round(gp / totalRev * 100)}% margin</span></span></div>
      </div>
      <div class="pl-section">
        <div class="pl-section-title">👥 Team Costs</div>
        <div class="pl-row sub"><span>Riya Sharma (Support Agent)</span><span class="pl-value">$1,200</span></div>
        <div class="pl-row sub"><span>Arjun Mehta (Onboarding Manager)</span><span class="pl-value">$1,500</span></div>
        <div class="pl-row total"><span>Total Team Cost</span><span class="pl-value">${fmt(f.salaries)}</span></div>
      </div>
      <div class="pl-section">
        <div class="pl-row profit"><span>Net Profit (Pre-Tax)</span><span class="pl-value">${fmt(np)}<span class="pl-pct">${Math.round(np / totalRev * 100)}% margin</span></span></div>
        <div class="pl-row sub" style="margin-top:8px"><span>Tax Reserve (${f.taxRate}%) <input type="number" value="${f.taxRate}" style="width:50px;padding:3px 6px;font-size:.8rem" onchange="updateTax(this.value)"/>%</span><span class="pl-value" id="taxValue">${fmt(tax)}</span></div>
        <div class="pl-row net-profit" id="postTaxRow"><span>Post-Tax Profit</span><span class="pl-value" id="postTaxValue">${fmt(postTax)}</span></div>
      </div>
    </div>`;

    // API Costs Tab
    $('apiCostKPIs').innerHTML = [
        { label: 'Total API Spend', value: '$275', change: '+$15 vs Feb', up: false },
        { label: 'Cost Per Query', value: '$0.016', change: 'improving ✓', up: true },
        { label: 'Projected Month-End', value: '$310', change: 'under $350 budget', up: true },
        { label: 'Budget Used', value: '79%', change: '$40 remaining', up: true },
    ].map(k => `<div class="kpi-card"><div class="kpi-label">${k.label}</div><div class="kpi-value font-display">${k.value}</div><div class="kpi-change ${k.up ? 'up' : 'down'}">${k.change}</div></div>`).join('');

    $('apiCostsTbody').innerHTML = f.apiCostClients.map(r => {
        const margin = r.sub - r.totCost;
        const mPct = r.sub ? Math.round(margin / r.sub * 100) : 0;
        return `<tr>
      <td><strong>${r.client}</strong></td><td>${badge('', r.plan)}</td>
      <td>${r.chatTok}</td><td>${r.callTok}</td><td>${r.totTok}</td>
      <td>$${r.chatCost}</td><td>$${r.callCost}</td><td><strong>$${r.totCost}</strong></td>
      <td>${r.sub ? fmt(r.sub) : 'Trial'}</td>
      <td style="${marginColor(margin)};font-weight:700">${r.sub ? fmt(margin) : '—'}</td>
      <td style="${marginColor(mPct)};font-weight:700">${r.sub ? mPct + '%' : '—'}</td>
    </tr>`;
    }).join('');

    // Trial Costs Tab
    $('trialCostKPIs').innerHTML = [
        { label: 'Total Trial Spend', value: '$45', change: 'this month', up: true },
        { label: 'Active Trials', value: '1', change: 'Marcus R.', up: true },
        { label: 'Converted (30d)', value: '2', change: '$248/mo revenue', up: true },
        { label: 'Not Converted', value: '1', change: '$22 spent, lost', up: false },
    ].map(k => `<div class="kpi-card"><div class="kpi-label">${k.label}</div><div class="kpi-value font-display">${k.value}</div><div class="kpi-change ${k.up ? 'up' : 'down'}">${k.change}</div></div>`).join('');

    $('trialCostsTbody').innerHTML = [
        { client: 'Marcus R.', start: 'Feb 18', days: 4, apiCost: 8, infra: 2, total: 10, status: 'Active', conv: 'Pending' },
        { client: 'Priya S.', start: 'Jan 3', days: 0, apiCost: 18, infra: 4, total: 22, status: 'Converted', conv: '✅ Starter' },
        { client: 'Tom B.', start: 'Jan 15', days: 0, apiCost: 13, infra: 4, total: 17, status: 'Churned', conv: '❌ Lost' },
    ].map(r => `<tr>
    <td><strong>${r.client}</strong></td><td>${r.start}</td>
    <td>${r.days > 0 ? `<div style="min-width:100px"><div class="progress-bar"><div class="progress-fill" style="width:${(r.days / 14) * 100}%;background:${r.days <= 3 ? 'var(--red)' : 'var(--accent)'}"></div></div><div style="font-size:.72rem;margin-top:2px;${r.days <= 3 ? 'color:var(--red);font-weight:700' : ''}">${r.days} days</div></div>` : '<span style="color:var(--text-muted)">Ended</span>'}</td>
    <td>$${r.apiCost}</td><td>$${r.infra}</td><td><strong>$${r.total}</strong></td>
    <td>${badge('', r.status)}</td><td>${r.conv}</td>
  </tr>`).join('');

    $('trialRoiSummary').innerHTML = [
        { label: 'Total Trial Spend', value: '$45', note: 'All trials this month' },
        { label: 'Revenue from Converted', value: '$247', note: 'Monthly recurring value' },
        { label: 'CAC via Trial', value: '$22.50', note: 'Cost per acquired customer' },
    ].map(r => `<div class="kpi-card"><div class="kpi-label">${r.label}</div><div class="kpi-value font-display" style="font-size:1.4rem">${r.value}</div><div class="kpi-change neutral">${r.note}</div></div>`).join('');

    // Revenue Tab
    $('revenueKPIs').innerHTML = [
        { label: 'MRR', value: '$6,200', change: '+$600 vs Feb', up: true },
        { label: 'New MRR', value: '+$748', change: '2 new clients', up: true },
        { label: 'Churned MRR', value: '-$49', change: '1 churn this month', up: false },
        { label: 'Net New MRR', value: '+$699', change: '11.3% growth', up: true },
    ].map(k => `<div class="kpi-card"><div class="kpi-label">${k.label}</div><div class="kpi-value font-display">${k.value}</div><div class="kpi-change ${k.up ? 'up' : 'down'}">${k.up ? '▲' : '▼'} ${k.change}</div></div>`).join('');

    $('renewalsList').innerHTML = [
        { name: 'Jessica P.', plan: 'Scale', amount: '$199', date: 'Mar 5' },
        { name: 'Sarah K.', plan: 'Pro', amount: '$99', date: 'Mar 12' },
        { name: 'David M.', plan: 'Pro', amount: '$99', date: 'Mar 28' },
    ].map(r => `<div class="list-row"><div class="list-row-left"><div class="client-avatar">${r.name.split(' ').map(x => x[0]).join('')}</div><div><div class="client-name">${r.name}</div><div class="client-email">${r.date}</div></div></div><div style="text-align:right">${badge('', r.plan)}<div style="font-family:'Fraunces',serif;font-weight:700;margin-top:4px">${r.amount}</div></div></div>`).join('');

    $('failedPayments').innerHTML = `<div class="list-row">
    <div class="list-row-left"><div class="client-avatar" style="background:var(--red)">MR</div><div><div class="client-name">Marcus R.</div><div class="client-email">Card declined — $49 Starter</div></div></div>
    <button class="act-btn primary">Retry</button>
  </div>`;
}

window.updateTax = function (rate) {
    const f = DATA.financials;
    const totalRev = f.revenue + f.setupFees;
    const totalCosts = f.apiCosts + f.callCosts + f.infra + f.trialCosts;
    const np = totalRev - totalCosts - f.salaries;
    const tax = Math.round(np * rate / 100);
    if ($('taxValue')) $('taxValue').textContent = fmt(tax);
    if ($('postTaxValue')) $('postTaxValue').textContent = fmt(np - tax);
};

// ---- API CONNECTIONS ----
function renderApiConnections() {
    $('apiConnKPIs').innerHTML = [
        { label: 'Total Integrations', value: '30', change: 'across 5 clients', up: true },
        { label: 'Connected', value: '21', change: '70% healthy', up: true },
        { label: 'Warnings', value: '3', change: 'degraded connections', up: false },
        { label: 'Disconnected / Error', value: '6', change: 'action needed', up: false },
    ].map(k => `<div class="kpi-card"><div class="kpi-label">${k.label}</div><div class="kpi-value font-display">${k.value}</div><div class="kpi-change ${k.up ? 'up' : 'down'}">${k.change}</div></div>`).join('');

    $('apiConnTbody').innerHTML = DATA.apiConn.map(r => `<tr>
    <td><strong>${r.client}</strong></td>
    <td title="Airbnb">${r.airbnb}</td><td title="WhatsApp">${r.whatsapp}</td>
    <td title="SMS">${r.sms}</td><td title="Guesty">${r.guesty}</td>
    <td title="Hostaway">${r.hostaway}</td><td title="Twilio">${r.twilio}</td>
    <td style="color:var(--text-muted);font-size:.8rem">${r.sync}</td>
    <td><span style="color:${r.errors > 0 ? 'var(--red)' : 'var(--green)'};font-weight:700">${r.errors}</span></td>
    <td><div class="action-btns"><button class="act-btn primary">Sync</button><button class="act-btn">Manage</button></div></td>
  </tr>`).join('');

    $('errorLog').innerHTML = [
        { time: '5 min ago', client: 'Marcus R.', int: 'WhatsApp', msg: 'Authentication token expired. Re-auth required.' },
        { time: '12 min ago', client: 'Priya S.', int: 'SMS / Twilio', msg: 'Failed to deliver message: Invalid phone number format.' },
        { time: '1 hr ago', client: 'David M.', int: 'SMS', msg: 'Rate limit exceeded. Throttling active.' },
    ].map(e => `<div class="error-row"><div style="white-space:nowrap;font-size:.72rem;color:var(--text-muted)">${e.time}</div><div><div style="font-weight:600">${e.client} — ${e.int}</div><div style="color:var(--text-muted);font-size:.78rem">${e.msg}</div></div><button class="act-btn primary" style="white-space:nowrap">Retry</button></div>`).join('');

    $('expiryGrid').innerHTML = DATA.apiKeys.map(k => `
    <div class="expiry-card ${k.days < 15 ? 'urgent' : ''}">
      <div class="expiry-name">${k.name}</div>
      <div style="font-family:monospace;font-size:.78rem;color:var(--text-muted);margin:.4rem 0">${k.key}</div>
      <div class="expiry-days ${k.days < 15 ? 'urgent' : k.days < 30 ? 'warn' : 'ok'}">${k.days}d</div>
      <div class="expiry-date">Expires ${k.expiry}</div>
      <button class="act-btn primary" style="margin-top:.75rem;width:100%">Renew</button>
    </div>`).join('');
}

// ---- MY TEAM ----
function renderMyTeam() {
    $('teamKPIs').innerHTML = [
        { label: 'Team Members', value: '3', change: '', up: true },
        { label: 'Monthly Salary Cost', value: '$2,700', change: 'Riya + Arjun', up: true },
        { label: 'Open Escalations', value: '3', change: '2 urgent', up: false },
        { label: 'Avg Response Time', value: '18 min', change: 'vs 25 min target', up: true },
    ].map(k => `<div class="kpi-card"><div class="kpi-label">${k.label}</div><div class="kpi-value font-display">${k.value}</div><div class="kpi-change ${k.up ? 'up' : 'down'}">${k.change}</div></div>`).join('');

    $('teamGrid').innerHTML = DATA.team.map(m => `
    <div class="team-card">
      <div class="team-avatar">${m.initials}</div>
      <div class="team-name">${m.name}</div>
      ${badge('', m.status)}
      ${badge('', m.role.split('/')[0].trim())}
      ${m.salary !== null ? `<div class="team-salary">${fmt(m.salary)}/mo</div>` : '<div class="team-salary" style="color:var(--accent)">Owner</div>'}
      <div class="team-stats">
        <div class="team-stat"><div class="team-stat-label">Clients</div><div class="team-stat-val font-display">${m.clients}</div></div>
        <div class="team-stat"><div class="team-stat-label">Escalations</div><div class="team-stat-val font-display" style="${m.escalations > 3 ? 'color:var(--red)' : ''}">${m.escalations}</div></div>
        <div class="team-stat"><div class="team-stat-label">Tickets (wk)</div><div class="team-stat-val font-display">${m.tickets}</div></div>
        <div class="team-stat"><div class="team-stat-label">Role</div><div style="font-size:.72rem;color:var(--text-muted);margin-top:2px">${m.role}</div></div>
      </div>
    </div>`).join('');

    $('escalationsTbody').innerHTML = DATA.escalations.map(e => `<tr>
    <td style="font-family:monospace;font-size:.78rem">${e.id}</td>
    <td>${e.client}</td><td>${e.issue}</td><td>${e.assigned}</td>
    <td style="${e.open.includes('hr') ? 'color:var(--red)' : ''}">${e.open}</td>
    <td>${badge('', e.priority)}</td><td>${badge('', e.status === 'In Progress' ? 'Trial' : e.status === 'Open' ? 'Active' : 'Churned')}</td>
    <td><div class="action-btns"><button class="act-btn primary">Take Over</button><button class="act-btn">Assign</button></div></td>
  </tr>`).join('');
}

// ---- ALERTS ----
function renderAlerts(filter = 'all') {
    let alerts = DATA.alerts;
    if (filter === 'critical') alerts = alerts.filter(a => a.type === 'critical');
    else if (filter === 'warning') alerts = alerts.filter(a => a.type === 'warning');
    else if (filter === 'info') alerts = alerts.filter(a => a.type === 'info');
    else if (filter === 'unread') alerts = alerts.filter(a => !a.read);

    $('alertList').innerHTML = alerts.map(a => `
    <div class="alert-item ${a.read ? '' : 'unread'}">
      <div class="alert-item-icon">${a.icon}</div>
      <div class="alert-item-body">
        <div class="alert-item-title">${badge('', a.type === 'critical' ? 'Active' : a.type === 'warning' ? 'Trial' : 'Churned')} ${a.title}</div>
        <div class="alert-item-detail">${a.msg} · <strong>${a.client}</strong></div>
      </div>
      <div class="alert-item-time">${a.time}</div>
      <div class="alert-item-actions">
        <button class="act-btn${a.read ? '' : ' primary'}" onclick="markRead(${a.id})">${a.read ? 'Read' : 'Mark Read'}</button>
        <button class="act-btn">Action</button>
      </div>
    </div>`).join('') || `<div class="empty-state"><div style="font-size:3rem;margin-bottom:1rem">✅</div><h4>No alerts here</h4><p>All clear in this category.</p></div>`;

    $('alertFilter').querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === filter);
        b.onclick = () => renderAlerts(b.dataset.filter);
    });
}
window.markRead = function (id) {
    const a = DATA.alerts.find(x => x.id === id);
    if (a) { a.read = true; renderAlerts(); }
};

// ---- SETTINGS ----
function renderSettings() {
    $('settingsSections').innerHTML = `
    <div class="settings-card">
      <div class="settings-card-header">🏢 Business Details</div>
      <div class="settings-body">
        <div class="settings-row"><span class="settings-label">Company Name</span><input class="settings-input" value="AllianzaAI"/></div>
        <div class="settings-row"><span class="settings-label">Timezone</span><select class="settings-input"><option>Asia/Kolkata (IST)</option><option>America/New_York</option><option>Europe/London</option></select></div>
        <div class="settings-row"><span class="settings-label">Currency</span><select class="settings-input"><option>USD ($)</option><option>EUR (€)</option><option>GBP (£)</option></select></div>
      </div>
    </div>
    <div class="settings-card">
      <div class="settings-card-header">💰 Plan Pricing</div>
      <div class="settings-body">
        <div class="pricing-inputs">
          <div class="pricing-input-group"><label>Starter</label><input type="number" value="49"/></div>
          <div class="pricing-input-group"><label>Pro</label><input type="number" value="99"/></div>
          <div class="pricing-input-group"><label>Scale</label><input type="number" value="199"/></div>
        </div>
      </div>
    </div>
    <div class="settings-card">
      <div class="settings-card-header">📊 Tax Settings</div>
      <div class="settings-body">
        <div class="settings-row"><span class="settings-label">Tax Rate (%)</span><input type="number" class="settings-input" value="25"/></div>
        <div class="settings-row"><span class="settings-label">Tax Type</span><select class="settings-input"><option>Income Tax</option><option>GST</option><option>VAT</option></select></div>
        <div class="settings-row"><span class="settings-label">Quarterly Reserve</span><button class="toggle-switch on"></button></div>
      </div>
    </div>
    <div class="settings-card">
      <div class="settings-card-header">🔑 Your API Keys</div>
      <div class="settings-body">
        ${DATA.apiKeys.map(k => `<div class="settings-row"><span class="settings-label">${k.name}</span><div class="api-key-row"><input type="password" value="${k.key}" class="settings-input"/><button class="act-btn" onclick="this.previousElementSibling.type=this.previousElementSibling.type==='password'?'text':'password'">Show</button><button class="act-btn">Copy</button></div></div>`).join('')}
        <div class="settings-row"><span class="settings-label">Infra Cost (monthly)</span><input type="number" class="settings-input" value="60" placeholder="$60"/></div>
      </div>
    </div>
    <div class="settings-card">
      <div class="settings-card-header">👥 Team Roles & Permissions</div>
      <div class="settings-body">
        <div class="table-wrap"><table class="perm-table"><thead><tr><th>Permission</th><th>Super Admin</th><th>Support Agent</th><th>Onboarding Manager</th></tr></thead><tbody>
          ${[['View P&L', ['✔', '✘', '✘']], ['Manage Clients', ['✔', '✔', '✔']], ['API Keys', ['✔', '✘', '✘']], ['Team Salaries', ['✔', '✘', '✘']], ['Settings', ['✔', '✘', '✘']], ['AI Monitor', ['✔', '✔', '✔']]].map(([perm, vals]) => `<tr><td>${perm}</td>${vals.map(v => `<td class="${v === '✔' ? 'perm-check' : 'perm-cross'}">${v}</td>`).join('')}</tr>`).join('')}
        </tbody></table></div>
      </div>
    </div>
    <div class="settings-card">
      <div class="settings-card-header">🔔 Notification Preferences</div>
      <div class="settings-body">
        <div class="notif-toggles">
          ${[['AI Instance Offline', true], ['Failed Payment', true], ['Trial Expiring', true], ['Escalation Unhandled', true], ['API Key Expiring', false], ['New Signup', true]].map(([label, on]) => `<div class="notif-row"><span>${label}</span><button class="toggle-switch${on ? ' on' : ''}" onclick="this.classList.toggle('on')"></button></div>`).join('')}
        </div>
      </div>
    </div>`;
}

// ---- INIT ROUTING ----
window.addEventListener('DOMContentLoaded', () => {
    renderOverview();
    renderClients();
    renderAiMonitor();
    renderFinancials();
    renderApiConnections();
    renderMyTeam();
    renderAlerts();
    renderSettings();
    renderChartsForPage('overview');
});
