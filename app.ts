import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (_, res) => {
  res.send("Zela API Online!");
});

app.listen(port, () => {
  console.log(`Zela app listening at http://localhost:${port}`);
});
