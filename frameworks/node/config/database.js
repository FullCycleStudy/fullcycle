import mysql from 'mysql';
const config = {
    host: `mysql`,
    port: 3306,
    multipleStatements: true,
    ssl: false,
    database: `nodedb`,
    user: `usernode`,
    password: `123456`
};

function mysqlConnect() {
    const connection = mysql.createConnection(config);
    connection.connect();
    return connection;
}

export default {
    mysqlConnect
};