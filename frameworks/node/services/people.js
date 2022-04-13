import insertPeople from '../model/people.js';

function InsertPeople (req, res, next) {
    let name = req.query.name;
    insertPeople(name);

    res.status(201);
    res.send(`Pessoa inserida com sucesso!`);
}

export default {
    InsertPeople
};