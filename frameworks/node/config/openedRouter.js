import express from 'express';
import peopleService from '../services/people.js';
import fullCycleService from '../services/fullcycle.js';

export default (server) => {
    const openApi = express.Router();
    server.use(`/oapi`, openApi);

    openApi.get(`/`, fullCycleService.FullCycle);
};