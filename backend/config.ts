import * as dotenv from 'dotenv';

dotenv.config({ path: `../.env` });

const configValues = {
  MONGO_URI: process.env.MONGO_URI ?? '',
  DB_NAME: process.env.DB_NAME ?? '',
  PORT: process.env.PORT
};

export default configValues;
