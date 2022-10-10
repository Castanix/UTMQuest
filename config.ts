import * as dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/.env` });

const configValues = {
  MONGO_URI: process.env.MONGO_URI ?? '',
  DB_NAME: process.env.DB_NAME ?? '',
};

export default configValues;
