import 'dotenv/config'
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import cors from "cors";
import countryData from './countryData';
import NodeCache from 'node-cache'

const app = express();
app.use(cors({ origin : process.env.CORS_ORIGIN_ALLOW }));
const cache = new NodeCache();

function cacheFileContent(filePath : string, cacheKey : string) : Promise<string> {
  return new Promise((resolve, reject) => {
    const cachedContent = cache.get(cacheKey);
    if (cachedContent) resolve(cachedContent as string);
    else {
      const readStream = fs.createReadStream(filePath, 'utf8');
      let data = '';
      readStream.on('data', chunk => {
          data += chunk;
      });
      readStream.on('end', () => {
          cache.set(cacheKey, data);
          resolve(data);
      });
      readStream.on('error', err => {
          console.error('Error reading file:', err);
          reject(err);
      });
    }
  });
}

app.get('/population-and-demography-data', (req: Request, res: Response) => {
  const keyName = "population-data";
  const csvFilePath = path.join(__dirname, '/assets/population-and-demography.csv');
  fs.access(csvFilePath, fs.constants.F_OK, async () => {
    const readStream = await cacheFileContent(csvFilePath, keyName);
    res.setHeader('Content-Type', 'text/plain');
    res.send(readStream);
  });
});

app.get('/countryInfo', (req: Request, res: Response) => {
  res.json(countryData);
})

const port = process.env.SERVER_PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at ${process.env.SERVER_HOST}:${port}`);
});
server.on('error', console.error);
