module.exports = {
  apps: [
    {
      name: 'ems-backend',
      script: 'src/server.js',
      cwd: 'C:\\employee-management-system\\backend',
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      error_file: 'C:\\employee-management-system\\logs\\backend-error.log',
      out_file: 'C:\\employee-management-system\\logs\\backend-out.log',
      time: true,
      autorestart: true,
      max_restarts: 50,
      restart_delay: 3000,
    },
    {
      name: 'ems-frontend',
      script: 'node_modules/.bin/react-scripts',
      args: 'start',
      cwd: 'C:\\employee-management-system\\frontend',
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        BROWSER: 'none'
      },
      error_file: 'C:\\employee-management-system\\logs\\frontend-error.log',
      out_file: 'C:\\employee-management-system\\logs\\frontend-out.log',
      time: true,
      autorestart: true,
      max_restarts: 50,
      restart_delay: 5000,
    }
  ]
};
