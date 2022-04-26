import peopleModel from '../model/people.js';

async function InsertPeople (req, res, next) {
    try {
        let name = req.query.name;
        await peopleModel.insertPeople(name);

        res.status(201);
        res.send(`Pessoa inserida com sucesso!`);
    } catch (error) {
        res.status(500);
        res.send(`Nao foi possivel inserir a Pessoa!`);
    }
}

export default {
    InsertPeople
};