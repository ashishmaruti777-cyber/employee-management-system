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

async function fix() {
  const admin = await req('POST', '/api/auth/login', { email: 'admin@company.com', password: 'password123' });
  const AT = admin.data.token;
  
  const roles = await req('GET', '/api/roles', null, AT);
  
  // Fix HR Manager - add roles permission
  const hrRole = roles.data.find(r => r.name === 'HR Manager');
  if (hrRole) {
    const existingRoles = hrRole.permissions.find(p => p.module === 'roles');
    if (!existingRoles) {
      hrRole.permissions.push({ module: 'roles', actions: ['create', 'read', 'update', 'delete', 'export'] });
    }
    const upd = await req('PUT', '/api/roles/' + hrRole._id, { permissions: hrRole.permissions }, AT);
    console.log('HR Manager roles permission:', upd.success ? 'ADDED!' : 'FAILED');
  }

  // Fix Team Lead - give full roles permission
  const tlRole = roles.data.find(r => r.name === 'Team Lead');
  if (tlRole) {
    const tlRoles = tlRole.permissions.find(p => p.module === 'roles');
    if (tlRoles) {
      tlRoles.actions = ['create', 'read', 'update', 'delete', 'export'];
    } else {
      tlRole.permissions.push({ module: 'roles', actions: ['create', 'read', 'update', 'delete', 'export'] });
    }
    const upd2 = await req('PUT', '/api/roles/' + tlRole._id, { permissions: tlRole.permissions }, AT);
    console.log('Team Lead roles permission:', upd2.success ? 'UPDATED!' : 'FAILED');
  }

  // Verify
  const verify = await req('GET', '/api/roles', null, AT);
  console.log('\n=== AFTER FIX ===');
  for (const r of verify.data) {
    const rolesPerm = r.permissions.find(p => p.module === 'roles');
    console.log(`${r.name}: roles = ${rolesPerm ? rolesPerm.actions.join(', ') : 'NONE'}`);
  }
}

fix().catch(e => console.error('ERROR:', e.message));
