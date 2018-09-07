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
      message: "Are you a customer or a manager? ",
      choices: ["Customer", "Manager"]
    })
    .then(function(answer) {
      if (answer.listProducts == "Customer") {
        listProducts();
      } else {
        startManager();
        2;
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

//============Manager functions================
// * List a set of menu options:

// * View Products for Sale

// * View Low Inventory

// * Add to Inventory

// * Add New Product

function startManager() {
  inquirer
    .prompt({
      name: "managerFunctions",
      type: "rawlist",
      message: "What would you like to do today?",
      choices: [
        "View products",
        "View low inventory",
        "Add to Inventory",
        "Add new products"
      ]
    })
    .then(function(answer) {
      if (answer.managerFunctions === "View products") {
        viewProducts();
      }
      if (answer.managerFunctions === "View low inventory") {
        lowInventory();
      }
      if (answer.managerFunctions === "Add to Inventory") {
        addInventory();
      }
      if (answer.managerFunctions === "Add new products") {
        addProducts();
      }
    });
}

function viewProducts() {
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
      startManager();
    }
  );
}

function lowInventory() {
  connection.query(
    "SELECT item_id, stock_quantity, product_name, price FROM products WHERE stock_quantity < 2",
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
      startManager();
    }
  );
}
function addInventory() {
  inquirer
    .prompt([
      {
        name: "productID",
        type: "input",
        message: "What is the ID number of the product you want to update?"
      },
      {
        name: "stockQuantity",
        type: "input",
        message: "How many units would you like to add?"
      }
    ])
    .then(function(answer) {
      var query = " SELECT * FROM products WHERE ?";
      connection.query(query, { item_id: answer.productID }, function(
        err,
        res
      ) {
        var unitsAvailable;
        var numAdded = answer.stockQuantity;
        for (var i = 0; i < res.length; i++) {
          unitsAvailable = res[i].stock_quantity;
        }
        if (numAdded > 0) {
          var query = "UPDATE products SET ? WHERE ?";
          connection.query(
            query,
            [
              {
                stock_quantity: (parseInt(unitsAvailable)) + (parseInt(numAdded))
              },
              {
                item_id: answer.productID
              }
            ],
            function(err) {
              if (err) {
                console.log(err);
              }
              console.log("Item has been updated");
            }
          );
          startManager();
        }
      });
    });
}
