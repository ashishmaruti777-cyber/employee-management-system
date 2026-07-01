const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost', port: 5000, path, method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);
    const req = http.request(opts, (res) => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => { try { resolve(JSON.parse(buf)); } catch(e) { resolve(buf); } });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function test() {
  // 1. Login
  const login = await request('POST', '/api/auth/login', { email: 'admin@company.com', password: 'password123' });
  const token = login.data.token;
  console.log('1. Login OK');

  // 2. Get roles
  const roles = await request('GET', '/api/roles', null, token);
  const role = roles.data[0];
  console.log('2. Got roles:', roles.data.length, 'roles');
  console.log('   First role:', role.name, '| ID:', role._id);
  console.log('   Permissions:', JSON.stringify(role.permissions));

  // 3. Update role - add a test permission
  const oldPerms = JSON.parse(JSON.stringify(role.permissions));
  const testPerm = { module: 'employees', actions: ['create', 'read', 'update', 'delete', 'export'] };
  const permIdx = oldPerms.findIndex(p => p.module === 'employees');
  if (permIdx >= 0) {
    oldPerms[permIdx] = testPerm;
  } else {
    oldPerms.push(testPerm);
  }
  
  console.log('\n3. Updating role permissions...');
  const update = await request('PUT', '/api/roles/' + role._id, {
    permissions: oldPerms
  }, token);
  
  if (update.success) {
    console.log('   Update SUCCESS!');
    console.log('   New permissions:', JSON.stringify(update.data.permissions));
  } else {
    console.log('   Update FAILED:', update.message);
  }

  // 4. Fetch role again to verify
  const verify = await request('GET', '/api/roles/' + role._id, null, token);
  console.log('\n4. Verify from DB:');
  console.log('   Permissions:', JSON.stringify(verify.data.permissions));
}

test().catch(e => console.error('ERROR:', e.message));
