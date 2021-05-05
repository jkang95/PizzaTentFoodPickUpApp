require('dotenv').config();

const { json } = require('body-parser');
const express = require('express');
const router  = express.Router();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

module.exports = (db) => {
  router.get("/", (req, res) => {
    db.query(`
    SELECT users.name, orders.id, is_accepted, is_completed, is_picked_up
    FROM orders
    JOIN users ON user_id = users.id
    ORDER BY orders.id;`)
      .then(data => {
        const users = data.rows;
        console.log("WHAT IS USERS IN ORDERS.JS", users);
        const username = "Nylah Hall"
          res.render("orders",{users, username});
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  // CREATE TABLE order_items (
  //   id SERIAL PRIMARY KEY NOT NULL,
  //   food_item_id INTEGER REFERENCES food_items(id) ON DELETE CASCADE,
  //   quantity SMALLINT NOT NULL,
  //   order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE
  // );

  router.post("/", (req, res) => {
    const itemsInCart = req.body.itemsInCart;
    const username = req.session.userName;
    const userId = req.session.userId;
    const insertQueryToRestaurant = `
    INSERT INTO orders (user_id) VALUES ($1) RETURNING *;
    `
    const insertQueryToHistory = `
    INSERT INTO order_items (food_item_id, quantity, order_id) VALUES($1, $2, $3) RETURNING *;
    `

    const reshape = (arr) => {
      let hash = {};
      for (let obj of arr){
          if (!hash[obj.foodId]) {

            hash[obj.foodId] = 1;
          }else {
            hash[obj.foodId]++
          }
      }
      let result = {"itemsInCart" : []};
      for (let item in hash) {
        let temp = {"foodId": item, "quantity": hash[item]};
        result["itemsInCart"].push(temp);
      }

    return result;
    }
    const dataForOrderHistory = reshape(itemsInCart);
    console.log(dataForOrderHistory);
    db.query(insertQueryToRestaurant, [userId])
    .then(data => {
      let orderId = data.rows[0]["id"];
      for (const elem in dataForOrderHistory.itemsInCart){
        let food_item_id = dataForOrderHistory.itemsInCart[elem]["foodId"];
        let quantity = dataForOrderHistory.itemsInCart[elem]["quantity"];

        db.query(insertQueryToHistory, [food_item_id,quantity,orderId])
        .then(data => console.log("success", data))
        .catch(err => console.error(err.message));
      }

      res.redirect("/");
    })
    .catch(err => {
      console.log("im in here line 84");
      res
        .status(500)
        .json({ error: err.message });
    });

      // client.messages
      // .create({body: `Hi there! Your order has been submitted! We will send you an update once the order has been accpeted by the restaurant.`, from: '+12343198009', to: '+16472954679'})
      // .then(message => console.log(message.sid));

      // client.messages
      // .create({body: `Hi there! Your order has been submitted! We will send you an update once the order has been accpeted by the restaurant.`, from: '+12343198009', to: '+447782322575'})
      // .then(message => console.log(message.sid));
    //res.render("index", {username});
  });

  router.post("/:id", (req, res) => {

    let queryUpdate = `
    UPDATE orders
    SET is_accepted = true
   `

    const queryParam = [req.params.id];
    if (req.query.status === "incomplete") {
      // const processingTime = req.body.processTime;
      // // client.messages
      // // .create({body: `Hi there! Your food will be ready in ${processingTime} minutes.`, from: '+18478921526', to: '+16472954679'})
      // // .then(message => console.log(message.sid));
    }

    if (req.query.status === "complete"){
      queryUpdate += ', is_completed = true '
      // client.messages
      // .create({body: 'Hi there Your food is ready Please come and pick it up!', from: '+18478921526', to: '+16472954679'})
      // .then(message => console.log(message.sid));
    }

    if (req.query.status === "pickedUp") {
      queryUpdate += ', is_picked_up = true '
    }

    queryUpdate += `WHERE id = $1;`

    db
    .query(queryUpdate, queryParam)
    .then(res.redirect("/orders"))
    .catch(err => {
      res.status(500).json({error: err.message});
    });
  });
  return router;
}
