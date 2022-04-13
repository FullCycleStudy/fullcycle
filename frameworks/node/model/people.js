import mysqlConnect from '../config/database.js';

function insertPeople(name) {
    const sql_command = `INSERT INTO people (name) VALUES ('${name}')`;

    const connection = mysqlConnect();
    connection.query(sql_command);
    connection.end();
}

export default {
    insertPeople
};