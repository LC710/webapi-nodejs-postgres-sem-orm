// require("dotenv").config();

const { query } = require("express");
const { connectionString } = require("pg/lib/defaults");

// Vamos usar aqui uma estratégia de conexão chamada "Connection Pool", é uma estratégia de conexão onde o "banco de dados" abre algumas conexões, a gente vai usando essas conexões e sempre que a gente precisar de uma nova conexão, ele paga uma conexão desse "pool", se tiver alguma ociosa ele te entrega ociosa se tiver que criar uma nova conexão ele cria ele cuida disso pra gente; Uma outra forma de fazer "conexão" seria fazer conexão "uma a uma", e fazer a "gestão de abrir e fechar", mas seria mais trabalhoso, trabalhar com "Connection Pool" costuma ser melhor, ajuda com performance;

// Então como trabalhamos com "Connection Pool" no "pg" :
async function connect(){
  // "Singleton":
  // Essa Estratégia a gente chama de "singleton", ela evita que vc tenha que ficar recriando objetos completamente o tempo todo, vc criou uma vez e reaproveita ele em todas as chamadas subsequentes;
  if (global.connection) return global.connection.connect(); // Para quando for chamar de novo a função "connect()" podemos verificar se já tem um "global.connection" carregado, pra não precisar ter que fazer tudo de novo;

  // Então toda vez que eu chamar a função "connect()" eu vou ter um "conexão", a primeira vez que eu chamar a função "connect()" eu vou fazer a "conexão" do "zero", nas vezes subsequentes eu só gero a "conexão" que já foi configurado;

  const { Pool } = require("pg"); // A biblioteca/pacote "pg" tem um monte de coisas, queremos só a classe "Pool", as chaves {} é para pegar só as partes que queremos da biblioteca/pacote;
  const pool = new Pool({
    connectionString: process.env.CONNECTION_STRING,
  });

  const client = await pool.connect();
  console.log("Criou o pool de Conexão");

  // O "select now()" pega a hora do banco de dados;
  const res = await client.query("select now()"); // Vai retornar um Array a hora está na posição [0];
  console.log(res.rows[0]); // A Hora está na posição zero;
  client.release(); // Para liberar a conexão;

  global.connect = pool; // O "global" é uma área global da aplicação onde vc pode guardar algumas coisas aqui estamos guardando uma variável "connection" e dentro dela eu to guardando o "pools", para quando for chamar de novo a função "connect()" podemos verificar se já tem um "global.connection" carregado, pra não precisar ter que fazer tudo de novo;
  return pool.connect();

  //   return client;
}

connect(); 

// module.exports = {
//     connect
// }

async function selectCustomers() {
    const client = await connect();
    const res = await client.query("SELECT * FROM clientes");
    return res.rows;
}

async function selectCustomer(id) {
    const client = await connect();
    // const res = await client.query("SELECT * FROM clientes WHERE ID=" + id); // Não fazer assim, pois pode dixar brecha para o ataque de famoso chamado de "SQL Injection"; 
    const res = await client.query("SELECT * FROM clientes WHERE ID=$1", [id]); // Essa forma e mais segura é chamada de "Prepared Statement" ou "Prepared Query";
    return res.rows;
}

async function insertCustomer(customer) {
    const client = await connect();
    const sql = "INSERT INTO clientes(nome, idade, uf) VALUES ($1, $2, $3)";
    const values = [customer.nome, customer.idade, customer.uf];
    await client.query(sql, values);
}

async function updateCustomer(id, customer) {
    const client = await connect();
    const sql = "UPDATE clientes SET nome=$1, idade=$2, uf=$3 WHERE id=$4";
    const values = [customer.nome, customer.idade, customer.uf, id];
    await client.query(sql, values);
}

async function deleteCustomer(id) {
    const client = await connect();
    const sql = "DELETE FROM clientes WHERE id=$1";
    const values = [id];
    await client.query(sql, values);
}

module.exports = {
    // connect
    selectCustomers,
    selectCustomer,
    insertCustomer,
    updateCustomer,
    deleteCustomer
}