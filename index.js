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

app.post("/add", async(req, res) => {
  const title = req.body.newItem;
  const query = "INSERT INTO items (title) VALUES ($1);"
  await client.query(query,[title]);
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  try {
    // Destructure the values from the request body
    const { updatedItemId: id, updatedItemTitle: title } = req.body;

    // SQL query to update the item title based on the provided ID
    const query = "UPDATE items SET title=$1 WHERE id=$2";

    // Execute the query with the provided parameters
    await client.query(query, [title, id]);

    // Redirect to the home page after a successful update
    res.redirect("/");
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error updating item:", error);

    // Send a 500 Internal Server Error response
    res.status(500).send("Error updating item.");
  }
});

app.post("/delete", async(req, res) => {
  try {
    // Destructure the values from the request body
    const { deleteItemId: id} = req.body;

    // SQL query to delete the item title based on the provided ID
    const query = "DELETE FROM items WHERE id=$1";

    // Execute the query with the provided parameters
    await client.query(query, [id]);

    // Redirect to the home page after a successful delete
    res.redirect("/");
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error deleting item:", error);

    // Send a 500 Internal Server Error response
    res.status(500).send("Error deleting item.");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
