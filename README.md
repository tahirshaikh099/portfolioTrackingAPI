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


## Software Requirements

- Node.js **v18.17+**
- MongoDB **v7+** (Recommended **7.0.1**)

## How to install

### Using Git (recommended)

1.  Clone the project from github. Change "myproject" to your project name.

```bash
git clone https://github.com/tahirshaikh099/portfolioTrackingAPI.git
```

### Using manual download ZIP

1.  Download repository
2.  Uncompress to your desired directory

### Install npm dependencies after installing (Git or manual download)

```bash
cd myproject
npm install
```

### Setting up environments

1.  You will find a file named `.env.example` on root directory of project.
2.  Create a new file by copying and pasting the file and then renaming it to just `.env`
    ```bash
    cp .env.example .env
    ```
3.  The file `.env` is already ignored, so you never commit your credentials.
4.  Change the values of the file to your environment. Helpful comments added to `.env.example` file to understand the constants.
