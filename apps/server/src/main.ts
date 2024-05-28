import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import cors from "cors";
import countryData from './countryData';

const app = express();
app.use(cors({ origin : "*"}));

app.get('/population-and-demography-data', (req: Request, res: Response) => {
  const csvFilePath = path.join(__dirname, '/assets/population-and-demography.csv');
  fs.access(csvFilePath, fs.constants.F_OK, () => {
    res.setHeader('Content-Type', 'text/plain');
    const readStream = fs.createReadStream(csvFilePath);
    readStream.pipe(res);
  });
});

app.get('/countryInfo', (req: Request, res: Response) => {
  res.json(countryData);
})

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
