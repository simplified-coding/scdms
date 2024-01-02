import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import rCertificates from "./api/certificates"

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/certs', rCertificates)
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
