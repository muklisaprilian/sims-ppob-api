const mysql = require("mysql2/promise");
const { Client } = require('pg');
const format = require("date-format");
const config = require("../config");
const { escape } = require("mysql2/promise");
const { KeiLog } = require("../lib/Logger");

const createConnection = async () => {
  return await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database
  });

  // const client = new Client({
  //   host: config.host,
  //   port: config.port,
  //   user: config.user,
  //   password: config.password,
  //   database: config.database
  // });

  // try {
  //   await client.connect();
  //   console.log('Connected to PostgreSQL');
  //   return client;
  // } catch (error) {
  //   console.error('Connection to PostgreSQL failed:', error);
  //   throw error;
  // }
};

const executeQuery = async (query) => {
  const conn = await createConnection();
  const [rows] = await conn.query(query);
  await conn.end();
  return rows;
};

const getFormattedDate = (date) => {
  return format("yyyy-MM-dd", date);
};
const getFormattedDatetime = (date) => {
  return format("yyyy-MM-dd hh:mm:ss", date);
};
const getFormattedMonth = (date) => {
  return format("yyMM", date);
};


// DDL
const createTableUser = async () => {
  const query = `CREATE TABLE IF NOT EXISTS tb_users (
  id int(11) NOT NULL auto_increment,
  email varchar(55) DEFAULT NULL,
  first_name varchar(55) DEFAULT NULL,
  last_name varchar(55) DEFAULT NULL,
  password varchar(100) DEFAULT NULL,
  token text DEFAULT NULL,
  profile_image varchar(100) DEFAULT NULL,
  balance varchar(100) DEFAULT '0',
  created timestamp NULL DEFAULT current_timestamp(),
  modified datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;
  return await executeQuery(query);
}
const createTableTransaction = async () => {
  const query = `CREATE TABLE IF NOT EXISTS tb_transaction (
  id int(11) NOT NULL auto_increment,
  users_id int(11) NOT NULL,
  service_id int(11) NOT NULL,
  invoice_number varchar(50) DEFAULT NULL,
  transaction_type varchar(50) DEFAULT NULL,
  description varchar(50) DEFAULT NULL,
  total_amount varchar(50) DEFAULT NULL,
  created_on timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;
  return await executeQuery(query);
}
const createTableServices = async () => {
  const query = `CREATE TABLE IF NOT EXISTS tb_services (
  id int(11) NOT NULL auto_increment,
  service_code varchar(50) DEFAULT NULL,
  service_name varchar(50) DEFAULT NULL,
  service_icon varchar(50) DEFAULT NULL,
  service_tariff varchar(50) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;
  return await executeQuery(query);
}
const createTableBanner = async () => {
  const query = `CREATE TABLE IF NOT EXISTS tb_banner (
  id int(11) NOT NULL auto_increment,
  banner_name varchar(50) DEFAULT NULL,
  banner_image varchar(50) DEFAULT NULL,
  description varchar(50) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;
  return await executeQuery(query);
}



const getUser = async (email) => {
  const query = `SELECT * FROM tb_users WHERE email='${email}'`;
  return await executeQuery(query);
};
//
const insertUser = async (email, first_name, last_name, password) => {
  const query = `INSERT INTO tb_users (email, first_name, last_name, password, profile_image) VALUES ('${email}', '${first_name}', '${last_name}', '${password}', 'https://yoururlapi.com/profile.jpeg');`;
  KeiLog("INFO" , "Insert kedalam tb users");
  return await executeQuery(query);
};
//
const updateTokenUser = async (email, token) => {
  const query = `UPDATE tb_users SET token='${token}' WHERE email='${email}'`;
  KeiLog("INFO" , "Update kedalam tb users");
  return await executeQuery(query);
};
//
const updateProfile = async (email, first_name, last_name) => {
  const query = `UPDATE tb_users SET first_name='${first_name}', last_name='${last_name}' WHERE email='${email}'`;
  KeiLog("INFO" , "Update kedalam tb users");
  return await executeQuery(query);
}
//
const updateProfileImage = async (email, imageUrl) => {
  const query = `UPDATE tb_users SET profile_image='${imageUrl}' WHERE email='${email}'`;
  KeiLog("INFO" , "Update kedalam tb users");
  return await executeQuery(query);
}
//
const getBanners = async () => {
  const query = `SELECT * FROM tb_banner`;
  return await executeQuery(query);
}
//
const getServices = async () => {
  const query = `SELECT * FROM tb_services`;
  return await executeQuery(query);
}
//
const getService = async (service_code) => {
  const query = `SELECT * FROM tb_services WHERE service_code='${service_code}'`;
  return await executeQuery(query);
}
//
const updateBalanceUser = async (email, userBalance) => {
  const query = `UPDATE tb_users SET balance='${userBalance}' WHERE email='${email}'`;
  KeiLog("INFO" , "Update kedalam tb users");
  return await executeQuery(query);
}
//
const insertTransaction = async (userid, servicesid, invoice, type, description, amount) => {
  const query = `INSERT INTO tb_transaction (users_id, service_id, invoice_number, transaction_type, description, total_amount) VALUES ('${userid}', '${servicesid}', '${invoice}', '${type}', '${description}', '${amount}');`;
  KeiLog("INFO" , "Insert kedalam tb transaction");
  return await executeQuery(query);  
}
//
const getHistory = async (offsets, limits) => {
  const limit = limits == 0 ? `` : `LIMIT ${limits} OFFSET ${offsets}`;
  const query = `SELECT * FROM tb_transaction ORDER BY created_on DESC ${limit}`;
  return await executeQuery(query);
}

module.exports = {
  createTableUser,
  createTableTransaction,
  createTableServices,
  createTableBanner,
  getUser,
  insertUser,
  updateTokenUser,
  updateProfile,
  updateProfileImage,
  getBanners,
  getServices,
  updateBalanceUser,
  insertTransaction,
  getService,
  getHistory
};
