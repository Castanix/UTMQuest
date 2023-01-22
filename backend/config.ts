import * as dotenv from 'dotenv';

dotenv.config({ path: `../.env` });

const configValues = {
  MONGO_URI: process.env.MONGO_URI ?? '',
  MONGO_TEST_URI: process.env.MONGO_TEST_URI ?? '',
  MONGO_TEST2_URI: process.env.MONGO_TEST2_URI ?? '',
  DB_NAME: process.env.DB_NAME ?? '',
  PORT: process.env.PORT
};

export default configValues;
