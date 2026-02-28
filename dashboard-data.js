// ==================== SAMPLE DATA ====================
const DATA = {
    clients: [
        { id: 1, name: 'Sarah K.', initials: 'SK', email: 'sarah@host.com', plan: 'Pro', status: 'Active', props: 3, queries: 1240, apiCost: 18, revenue: 99, health: 92, joined: 'Jan 12, 2025', assigned: 'Riya Sharma', integrations: { airbnb: true, whatsapp: true, sms: true, guesty: true, hostaway: false, twilio: true } },
        { id: 2, name: 'Marcus R.', initials: 'MR', email: 'marcus@host.com', plan: 'Starter', status: 'Trial', props: 1, queries: 320, apiCost: 8, revenue: 0, health: 61, joined: 'Feb 18, 2025', daysLeft: 4, assigned: 'Arjun Mehta', integrations: { airbnb: true, whatsapp: false, sms: true, guesty: false, hostaway: false, twilio: false } },
        { id: 3, name: 'Jessica P.', initials: 'JP', email: 'jessica@host.com', plan: 'Scale', status: 'Active', props: 7, queries: 3820, apiCost: 45, revenue: 199, health: 88, joined: 'Dec 5, 2024', assigned: 'Riya Sharma', integrations: { airbnb: true, whatsapp: true, sms: true, guesty: true, hostaway: true, twilio: true } },
        { id: 4, name: 'David M.', initials: 'DM', email: 'david@host.com', plan: 'Pro', status: 'Active', props: 2, queries: 890, apiCost: 12, revenue: 99, health: 79, joined: 'Jan 28, 2025', assigned: 'Arjun Mehta', integrations: { airbnb: true, whatsapp: true, sms: false, guesty: false, hostaway: false, twilio: true } },
        { id: 5, name: 'Priya S.', initials: 'PS', email: 'priya@host.com', plan: 'Starter', status: 'Active', props: 1, queries: 410, apiCost: 5, revenue: 49, health: 95, joined: 'Feb 3, 2025', assigned: 'Riya Sharma', integrations: { airbnb: true, whatsapp: true, sms: false, guesty: false, hostaway: false, twilio: false } },
    ],
    team: [
        { name: 'Komal (You)', initials: 'KO', role: 'Super Admin / Owner', salary: null, clients: 5, escalations: 1, tickets: 12, status: 'Online' },
        { name: 'Riya Sharma', initials: 'RS', role: 'Support Agent', salary: 1200, clients: 8, escalations: 3, tickets: 24, status: 'Online' },
        { name: 'Arjun Mehta', initials: 'AM', role: 'Onboarding Manager', salary: 1500, clients: 12, escalations: 2, tickets: 18, status: 'Away' },
    ],
    alerts: [
        { id: 1, type: 'critical', icon: '🔴', title: 'AI Offline', msg: 'Jessica P. — Property 3 AI instance went offline', client: 'Jessica P.', time: '2 min ago', read: false },
        { id: 2, type: 'critical', icon: '🔴', title: 'Failed Payment', msg: 'Marcus R. — Starter plan payment failed ($49)', client: 'Marcus R.', time: '15 min ago', read: false },
        { id: 3, type: 'warning', icon: '🟡', title: 'Trial Expiring', msg: 'Marcus R. — Trial ends in 4 days', client: 'Marcus R.', time: '1 hr ago', read: false },
        { id: 4, type: 'warning', icon: '🟡', title: 'Escalation Unhandled', msg: 'David M. — Guest issue open for 45 min', client: 'David M.', time: '45 min ago', read: false },
        { id: 5, type: 'warning', icon: '🟡', title: 'API Key Expiring', msg: 'OpenAI API key expires in 12 days', client: 'System', time: '2 hr ago', read: false },
        { id: 6, type: 'info', icon: '🟢', title: 'New Signup', msg: 'Priya S. started a free trial on Starter plan', client: 'Priya S.', time: '3 hr ago', read: true },
        { id: 7, type: 'info', icon: '🟢', title: 'Client Converted', msg: 'Sarah K. upgraded from Trial to Pro', client: 'Sarah K.', time: '1 day ago', read: true },
    ],
    financials: {
        revenue: 6200, setupFees: 300, apiCosts: 180, callCosts: 95, infra: 60, trialCosts: 45,
        salaries: 2700, taxRate: 25,
        mrr: [2100, 2800, 3200, 3900, 4400, 4800, 5200, 5600, 5800, 6000, 6100, 6200],
        momLabels: ['Jan', 'Feb', 'Mar'],
        momRevenue: [4800, 5500, 6200], momCosts: [2900, 3100, 3200],
        queryData: Array.from({ length: 30 }, (_, i) => Math.floor(800 + Math.random() * 1200 + i * 30)),
        apiCostClients: [
            { client: 'Sarah K.', plan: 'Pro', chatTok: '420K', callTok: '80K', totTok: '500K', chatCost: 12, callCost: 6, totCost: 18, sub: 99 },
            { client: 'Marcus R.', plan: 'Starter', chatTok: '180K', callTok: '20K', totTok: '200K', chatCost: 6, callCost: 2, totCost: 8, sub: 0 },
            { client: 'Jessica P.', plan: 'Scale', chatTok: '900K', callTok: '200K', totTok: '1.1M', chatCost: 32, callCost: 13, totCost: 45, sub: 199 },
            { client: 'David M.', plan: 'Pro', chatTok: '300K', callTok: '60K', totTok: '360K', chatCost: 9, callCost: 3, totCost: 12, sub: 99 },
            { client: 'Priya S.', plan: 'Starter', chatTok: '120K', callTok: '20K', totTok: '140K', chatCost: 4, callCost: 1, totCost: 5, sub: 49 },
        ],
    },
    kanban: {
        Lead: [{ name: 'Tom B.', initials: 'TB', days: 2, member: 'AM' }, { name: 'Lily C.', initials: 'LC', days: 5, member: 'RS' }],
        Trial: [{ name: 'Marcus R.', initials: 'MR', days: 10, member: 'AM' }],
        'Setup': [{ name: 'Nora J.', initials: 'NJ', days: 3, member: 'RS' }],
        Live: [{ name: 'Sarah K.', initials: 'SK', days: 0, member: 'RS' }, { name: 'Jessica P.', initials: 'JP', days: 0, member: 'RS' }, { name: 'David M.', initials: 'DM', days: 0, member: 'AM' }],
        Review: [{ name: 'Priya S.', initials: 'PS', days: 1, member: 'RS' }],
    },
    escalations: [
        { id: 'ESC-001', client: 'David M.', issue: 'Guest locked out at 11pm', assigned: 'Riya Sharma', open: '45 min', priority: 'Urgent', status: 'Open' },
        { id: 'ESC-002', client: 'Jessica P.', issue: 'WiFi router offline — guest complaint', assigned: 'Arjun Mehta', open: '2 hr', priority: 'Normal', status: 'In Progress' },
        { id: 'ESC-003', client: 'Sarah K.', issue: 'Early check-in request needs host approval', assigned: 'Riya Sharma', open: '20 min', priority: 'Low', status: 'Open' },
    ],
    apiConn: [
        { client: 'Sarah K.', airbnb: '✅', whatsapp: '✅', sms: '✅', guesty: '✅', hostaway: '⚠️', twilio: '✅', sync: '2 min ago', errors: 0 },
        { client: 'Marcus R.', airbnb: '✅', whatsapp: '❌', sms: '✅', guesty: '❌', hostaway: '❌', twilio: '❌', sync: '1 hr ago', errors: 3 },
        { client: 'Jessica P.', airbnb: '✅', whatsapp: '✅', sms: '✅', guesty: '✅', hostaway: '✅', twilio: '✅', sync: '1 min ago', errors: 0 },
        { client: 'David M.', airbnb: '✅', whatsapp: '✅', sms: '⚠️', guesty: '❌', hostaway: '❌', twilio: '✅', sync: '5 min ago', errors: 1 },
        { client: 'Priya S.', airbnb: '✅', whatsapp: '✅', sms: '❌', guesty: '❌', hostaway: '❌', twilio: '❌', sync: '10 min ago', errors: 2 },
    ],
    apiKeys: [
        { name: 'OpenAI API', key: 'sk-••••••••••••••••3a4f', expiry: 'Mar 12, 2025', days: 11 },
        { name: 'Twilio Voice', key: 'AC••••••••••••••••b2c1', expiry: 'Apr 5, 2025', days: 35 },
        { name: 'Anthropic', key: 'sk-ant-••••••••••••••9f2e', expiry: 'Jun 1, 2025', days: 92 },
    ],
    liveConvos: [
        { client: 'Sarah K.', channel: 'WhatsApp', msg: 'What time is check-in tomorrow?', ai: 'Check-in is from 3:00 PM. Early check-in may be available — just let us know!', time: 'Just now' },
        { client: 'Jessica P.', channel: 'Airbnb', msg: 'Is there parking for 2 cars?', ai: 'Yes! Free street parking for up to 2 vehicles right in front. 🚗', time: '1 min ago' },
        { client: 'David M.', channel: 'SMS', msg: 'WiFi not connecting', ai: 'Network: CasaVerde_5G — Password: CozyStay2024. Restart the router if needed!', time: '2 min ago' },
        { client: 'Priya S.', channel: 'WhatsApp', msg: 'Are pets allowed?', ai: 'Yes, well-behaved pets welcome! Small pet fee of $25 applies. 🐾', time: '3 min ago' },
    ],
};
