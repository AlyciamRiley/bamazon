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
    //querys the database for the item id, name of the product
    "SELECT item_id, stock_quantity, product_name, price FROM products",
    //res is the response variable that holds the data from the table
    function(err, res) {
      //loops through the results to pull product information- stops once it has reached the end of the list.
      for (var i = 0; i < res.length; i++) {
        console.log(
          "Item ID: " +
          
            res[i].item_id +
            "\nNumber in Stock: " + res[i].stock_quantity + 
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
      //querys the database for all data
      var query = "SELECT * FROM products WHERE ?";
      //attaches the user answer to the item_id from the database and then runs a function on that data
      connection.query(query, { item_id: answer.productID }, function(
        err,
        res
      ) {
  
        var unitsAvailable;
        var unitPrice;
        //units requested is pulled from the inquirer prompt
        var unitsRequested = answer.stockQuantity;
        //this loop is pulling from the data stored in res, which is the data from the DB
        for (var i = 0; i < res.length; i++) {
          //the unitsAvailable var is being updated with the data from the for look- which is the response from stock_quantity entry. 
          unitsAvailable = res[i].stock_quantity;
          //unitPrice is doing the same thing as units Available
          unitPrice = res[i].price;
        }
      
        //running if then statement on the above data.  if the answer to the units requested inquirer prompt is less than or equal to the units available (which is defined above), then the table needs to be updated with the new number
        if(answer.stockQuantity <= unitsAvailable){
          //create variable where units requested is subtracted from ode units available
          
          //table is being updated.  
          var query = "UPDATE products SET ? WHERE ?";
          connection.query(
            query, 
            [
              {
                stock_quantity: unitsAvailable-unitsRequested 
              },
              {
                item_id: answer.productID
              }
            ],
            function(err){
              if(err){
                console.log(err);
              }
              console.log("order has been placed");
              //to fixed rounds the decimals so they don't all display.  the (2) indicates how many decimal places there should be.
            console.log("Total for your purchase is: " + (unitPrice * answer.stockQuantity).toFixed(2));
            shopAgain();
            }
            
            
          );
      } else {
          console.log("Sorry, we do not currently have enough stock to place your order.");
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

