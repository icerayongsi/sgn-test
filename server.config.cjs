module.exports = {
    apps: [
      {
        name: 'server:prod',
        script: './dist/apps/server/main.js',
        exec_mode: 'cluster',
        instance_var: 'INSTANCE_ID',
        instances: 1,
        autorestart: true,
        watch: false,
        ignore_watch: ['node_modules', 'logs'],
        max_memory_restart: '1G',
        merge_logs: true,
        output: './logs/access.log',
        error: './logs/error.log',
        env: {
            SERVER_HOST: "localhost",
            SERVER_PORT: "3333",
            CORS_ORIGIN_ALLOW: "*"
        },
      },
      {
        name: 'server:dev',
        script: 'npx',
        args: 'nx serve server',
        exec_mode: 'fork',
        autorestart: true,
        watch: true,
        ignore_watch: ['node_modules', 'logs'],
        max_memory_restart: '1G',
        merge_logs: true,
        output: './logs/access.log',
        error: './logs/error.log',
        env: {
            SERVER_HOST: "localhost",
            SERVER_PORT: "3333",
            CORS_ORIGIN_ALLOW: "*"
        },
      },
    ]
  }
  