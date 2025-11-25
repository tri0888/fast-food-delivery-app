import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Food from '../models/foodModel.js';
import Orders from '../models/orderModel.js';
import User from '../models/userModel.js';
import Restaurant from '../models/restaurantModel.js';

import { fileURLToPath } from 'url';
import path from 'path';

// __dirname trong ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({path: './../.env'});// ai nói không sửa được? ông dẫn đường dẫn sai nên nó không config được thôi

const DB = process.env.NODE_ENV === "docker"
    ? process.env.DATABASE_DOCKER.replace("<PASSWORD>", process.env.DATABASE_PASSWORD)
    : process.env.DATABASE_LOCAL.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));

// READ JSON FILE
const foods = JSON.parse(
  fs.readFileSync(`${__dirname}/fast-food.foods.json`, 'utf-8')
);
const orders = JSON.parse(
  fs.readFileSync(`${__dirname}/fast-food.orders.json`, 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/fast-food.users.json`, 'utf-8')
);
const restaurants = JSON.parse(
  fs.readFileSync(`${__dirname}/fast-food.restaurants.json`, 'utf-8')
);
// const superadmin = JSON.parse(
//   fs.readFileSync(`${__dirname}/superadmin.json`, 'utf-8')
// );

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Restaurant.create(restaurants);
    await Food.create(foods);
    await Orders.create(orders);
    await User.create(users);
    // await User.create(superadmin);

    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Orders.deleteMany();
    await Food.deleteMany();
    await User.deleteMany();
    await Restaurant.deleteMany();

    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
