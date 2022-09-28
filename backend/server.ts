import express, { Request, Response } from "express";
import { connectDB } from "./db/db.service"

const app = express();
const port = process.env.PORT || 5001;

app.get('/express_backend', (req: Request, res: Response) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});

connectDB().then(async (collection) => {
  app.listen(port, () => console.log(`Listening on port ${port}`));  


}).catch((error: Error) => {
  console.error(`Error could not connect to db: ${error}`);
})