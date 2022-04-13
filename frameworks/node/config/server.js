import express from 'express';
import queryParser from 'express-query-int';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import debug from 'debug';

const log = debug('config:server');

const server = express();
const port = process.env.PORT || 3000;
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

server.use(cors(corsOptions));
server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use(queryParser());
server.use(fileUpload({ createParentPath: true }));

server.use((req, res, next) => {
	next();
});

server.listen(port, () => {
    let msg =`MicroService is running on port ${port}...`;
    console.log(msg);
    log(msg);
});

export default server;