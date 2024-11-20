require("dotenv").config();
const db = require("./db.js"); // A função "connect()" está sendo chamada no próprio arquivo; por isso não usamos o "module.exports = { connect }" no arquivo "db.js" e tbm não usamos o "db.connect" no "index.js", pois já está chamando no proprio arquivo que vai ser carregado com o "require()", mas poderia ser feito dessa outra forma tbm;

// db.connect();

const port = process.env.PORT;

const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Funcionando !"
    })
})

app.get("/clientes/:id", async (req, res) => {
    
    const cliente = await db.selectCustomer(req.params.id);
    res.json(cliente);
})

app.get("/clientes", async (req, res) => {
    const clientes = await db.selectCustomers();
    res.json(clientes);
})

app.post("/clientes", async (req, res) => {
    await db.insertCustomer(req.body);
    res.sendStatus(201);
})

app.patch("/clientes/:id", async (req, res) => {
  
    // await db.updateCustomer(req.params.id, req.body);

    const id = req.params.id;
    const client = req.body;
    await db.updateCustomer(id, client);
    
    res.sendStatus(200);
})

app.delete("/clientes/:id", async (req, res) => {

    // await db.deleteCustomer(req.params.id);

    const id = req.params.id;
   
    await db.deleteCustomer(id);

    res.sendStatus(204);
})



app.listen(port);

console.log("Backend Rodando");