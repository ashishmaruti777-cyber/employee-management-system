const http = require('http');

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = { hostname: 'localhost', port: 5000, path, method, headers: { 'Content-Type': 'application/json' } };
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);
    const r = http.request(opts, (res) => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => { try { resolve(JSON.parse(buf)); } catch(e) { resolve(buf); } });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function test() {
  // 1. Login as HR Manager
  console.log('=== 1. HR Manager Login ===');
  const hrLogin = await req('POST', '/api/auth/login', { email: 'manager@company.com', password: 'password123' });
  if (!hrLogin.success) {
    console.log('Login FAILED:', hrLogin.message);
    return;
  }
  const HT = hrLogin.data.token;
  console.log('User:', hrLogin.data.user.name, '| Role:', hrLogin.data.user.role);
  console.log('Permissions:');
  hrLogin.data.user.rolePermissions.forEach(p => console.log('  ' + p.module + ': ' + p.actions.join(', ')));

  // 2. Try to get roles
  console.log('\n=== 2. GET Roles ===');
  const roles = await req('GET', '/api/roles', null, HT);
  console.log('Result:', roles.success ? 'SUCCESS (' + roles.data.length + ' roles)' : 'FAILED: ' + roles.message);

  // 3. Try to UPDATE a role
  console.log('\n=== 3. UPDATE Team Lead role ===');
  const tlRole = roles.data.find(r => r.name === 'Team Lead');
  if (tlRole) {
    const upd = await req('PUT', '/api/roles/' + tlRole._id, { description: 'Updated by HR Manager at ' + new Date().toLocaleTimeString() }, HT);
    console.log('Result:', upd.success ? 'SUCCESS!' : 'FAILED: ' + upd.message);
    if (!upd.success) console.log('Full response:', JSON.stringify(upd));
  }

  // 4. Try to CREATE a role
  console.log('\n=== 4. CREATE new role ===');
  const create = await req('POST', '/api/roles', { name: 'Test Role ' + Date.now(), description: 'Test', permissions: [{ module: 'employees', actions: ['read'] }] }, HT);
  console.log('Result:', create.success ? 'SUCCESS!' : 'FAILED: ' + create.message);

  // 5. Try to DELETE the test role
  if (create.success) {
    console.log('\n=== 5. DELETE test role ===');
    const del = await req('DELETE', '/api/roles/' + create.data._id, null, HT);
    console.log('Result:', del.success ? 'SUCCESS!' : 'FAILED: ' + del.message);
  }
}

test().catch(e => console.error('ERROR:', e.message));
