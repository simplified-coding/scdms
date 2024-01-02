import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import swaggerUI from "swagger-ui-express"

import rCertificates from "./api/certificates"

import swaggerDocument from "./assets/OpenAPI.json"

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// Routes
app.use('/certs', rCertificates)
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
