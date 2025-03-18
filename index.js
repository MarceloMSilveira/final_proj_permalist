import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import pg from "pg";
import 'dotenv/config'

const app = express();
const port = 3000;
const {Client} = pg;

if (!(process.env.db_pwd)) {
  console.log("Erro ao acessar o password do banco de dados.")
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(morgan('dev'));

const client = new Client({
  user: 'postgres',
  password: process.env.db_pwd,
  host: 'localhost',
  port: 5432,
  database: 'permalist',
});

await client.connect();

app.get("/", async (req, res) => {
  const result = await client.query("SELECT * FROM items;");
  const items = result.rows;
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", (req, res) => {
  const item = req.body.newItem;
  items.push({ title: item });
  res.redirect("/");
});

app.post("/edit", (req, res) => {});

app.post("/delete", (req, res) => {});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
