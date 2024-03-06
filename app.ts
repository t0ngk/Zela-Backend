import express from "express";
import cors from "cors";
import authRouter from "./src/routes/auth";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.use("/auth", authRouter);

app.get("/", (_, res) => {
  res.send("Zela API Online!");
});

app.listen(port, () => {
  console.log(`Zela app listening at http://localhost:${port}`);
});
