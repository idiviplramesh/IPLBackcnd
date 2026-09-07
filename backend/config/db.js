const sql = require("mssql");

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  options: {
    instanceName: process.env.DB_INSTANCE,
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },

  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },

  connectionTimeout: 15000,
  requestTimeout: 30000,
};

let poolPromise = null;

async function getPool() {
  if (poolPromise) {
    return poolPromise;
  }

  console.log("=================================");
  console.log("Connecting to SQL Server...");
  console.log("Server:", config.server);
  console.log("Instance:", config.options.instanceName);
  console.log("Database:", config.database);
  console.log("User:", config.user);
  console.log("=================================");

  poolPromise = sql
    .connect(config)
    .then((pool) => {
      console.log("SQL Server connected successfully");
      console.log("=================================");

      return pool;
    })
    .catch((error) => {
      console.error("=================================");
      console.error("SQL Server connection failed:");
      console.error(error.message);
      console.error("=================================");

      poolPromise = null;

      throw error;
    });

  return poolPromise;
}

module.exports = {
  sql,
  getPool,
};
