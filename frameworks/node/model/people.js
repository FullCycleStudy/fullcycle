import database from '../config/database.js';

async function insertPeople(name) {
    const sql_command = `INSERT INTO people (name) VALUES ('${name}')`;

    const connection = database.mysqlConnect();
    await connection.query(sql_command);
    connection.end();
}

export default {
    insertPeople
};