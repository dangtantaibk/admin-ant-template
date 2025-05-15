module.exports = {
    apps: [
      {
        name: "admin-ant-template",
        script: "./server.js",
        instances: "max",
        exec_mode: "cluster",
        env: {
          NODE_ENV: "production",
          PORT: 3101
        },
        env_production: {
          NODE_ENV: "production",
          PORT: 80
        }
      }
    ]
  };