module.exports = {
  apps: [
    {
      name: "marketing-campaigns-backend-dev",
      script: "dist/server.js",
      instances: 1,
      watch: false,
      env: {
        NODE_ENV: "development",
        PORT: 5000
      }
    },
    {
      name: "marketing-campaigns-backend-prod",
      script: "dist/server.js",
      instances: "max", // ⚙️ Utilizes all CPU cores
      exec_mode: "cluster",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    }
  ]
};
