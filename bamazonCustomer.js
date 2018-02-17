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
//   start();
  promptUser();
});

function start() {
  connection.query(
    "SELECT item_id, product_name, price FROM products",
    function(err, res) {
      for (var i = 0; i < res.length; i++) {
        console.log(
          "Item ID: " +
            res[i].item_id +
            "\nProduct: " +
            res[i].product_name +
            "\nPrice: " +
            res[i].price +
            "\n================================="
        );
      }
    }
  );
}

function promptUser(){
    inquirer
    .prompt({
        name: "productID",
        type: "input",
        message: "What is the ID number of the product you want to buy?"
    })
    .then(function(answer){
        var query = "SELECT item_id, product_name, price FROM products WHERE ?";
        connection.query(query, { item_id: answer.productID }, 
        function(err, res) { 
            for (var i = 0; i < res.length; i++) {
                console.log(
                  "Item ID: " +
                    res[i].item_id +
                    "\nProduct: " +
                    res[i].product_name +
                    "\nPrice: " +
                    res[i].price +
                    "\n================================="
                );
              }
        })
    })
}
