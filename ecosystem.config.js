module.exports = {
  apps: [
    // --------------------------------------
    // 1) API SERVER (DEVELOPMENT)
    // --------------------------------------
    {
      name: "mailstorm-api-dev",
      script: "dist/server.js",
      instances: 1,
      watch: true,
      env: {
        NODE_ENV: "development",
        PORT: 5000
      }
    },

    // --------------------------------------
    // 2) WORKER (DEVELOPMENT)
    // --------------------------------------
    {
      name: "mailstorm-worker-dev",
      script: "dist/worker/sendEmailWorker.js",
      instances: 1,
      watch: true,
      env: {
        NODE_ENV: "development"
      }
    },

    // --------------------------------------
    // 3) API SERVER (PRODUCTION)
    // --------------------------------------
    {
      name: "mailstorm-api",
      script: "dist/server.js",
      instances: "max",       // full CPU usage
      exec_mode: "cluster",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    },

    // --------------------------------------
    // 4) WORKER (PRODUCTION)
    // --------------------------------------
    {
      name: "mailstorm-worker",
      script: "dist/worker/sendEmailWorker.js",
      instances: 2,           // scale workers separately
      exec_mode: "cluster",
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
