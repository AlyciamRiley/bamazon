var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Jonsnow123",
  database: "bamazon_db"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  start();
});

//===========start function begins============
function start() {
  inquirer
    .prompt({
      name: "listProducts",
      type: "rawlist",
      message: "Are you ready to shop? ",
      choices: ["YES", "NO"]
    })
    .then(function(answer) {
      if (answer.listProducts == "YES") {
        listProducts();
      } else {
        console.log("Well what are you waiting for?");
        start();
      }
    });
}

//===========ListProducts function begins============

function listProducts() {
  connection.query(
    "SELECT item_id, stock_quantity, product_name, price FROM products",
    function(err, res) {
      for (var i = 0; i < res.length; i++) {
        console.log(
          "Item ID: " +
            res[i].item_id +
            "\nNumber in Stock: " +
            res[i].stock_quantity +
            "\nProduct: " +
            res[i].product_name +
            "\nPrice: " +
            res[i].price +
            "\n=================================\n\n"
        );
      }
      promptUser();
    }
  );
}

//===========prompt user function begins============
function promptUser() {
  inquirer
    .prompt([
      {
        name: "productID",
        type: "input",
        message: "What is the ID number of the product you want to buy?"
      },

      {
        name: "stockQuantity",
        type: "input",
        message: "How many would you like to buy?"
      }
    ])
    .then(function(answer) {
      var query = "SELECT * FROM products WHERE ?";
      connection.query(query, { item_id: answer.productID }, function(
        err,
        res
      ) {
        var unitsAvailable;
        var unitPrice;
        var unitsRequested = answer.stockQuantity;
        for (var i = 0; i < res.length; i++) {
          unitsAvailable = res[i].stock_quantity;
          unitPrice = res[i].price;
        }

        if (answer.stockQuantity <= unitsAvailable) {
          var query = "UPDATE products SET ? WHERE ?";
          connection.query(
            query,
            [
              {
                stock_quantity: unitsAvailable - unitsRequested
              },
              {
                item_id: answer.productID
              }
            ],
            function(err) {
              if (err) {
                console.log(err);
              }
              console.log("order has been placed");
              console.log(
                "Total for your purchase is: " +
                  (unitPrice * answer.stockQuantity).toFixed(2)
              );
              shopAgain();
            }
          );
        } else {
          console.log(
            "Sorry, we do not currently have enough stock to place your order."
          );
          start();
        }
      });
    });
}
//===========shop again function begins============
function shopAgain() {
  inquirer
    .prompt({
      name: "listProducts",
      type: "rawlist",
      message: "Would you like to purchase another item? ",
      choices: ["YES", "NO"]
    })
    .then(function(answer) {
      if (answer.listProducts == "YES") {
        listProducts();
      } else {
        console.log("Thanks for shopping with Bamazon!");
      }
    });
}
