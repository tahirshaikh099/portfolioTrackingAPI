# Portfolio Tracking API

A portfolio tracking API that allows adding/deleting/updating trades and can do basic return calculations etc.


```bash
├── app
│ ├── controllers
│  └── Controller.js: This defines all the logic that will be executed based on the particular endpoint of the api.
│
│
│ ├── models
│  └── PortfolioModel.js : This defines the schema for the portfolio containing a collection of stocks.
│  └── StockModel.js : This defines the schema for the stocks collection.
│  └── TransactionModel.js : This defines the schema for the Transaction (BUY/SELL) stocks collection.
│  └── UserModel.js : This defines the schema for the User data collection.  
│
│
├──routes
│  └── Router.js : This defines all the api endpoint and associate them with the Function of the endpoint defined in the controllers.
│
│
├──db
│  └── Connect.js This contains function to connect to the database.
│
│
└── index.js : This contains the main code for setting up express server and It also contains Code to establish connection with the Database. It also connect all   
                defined Routes for the api to server.
```
