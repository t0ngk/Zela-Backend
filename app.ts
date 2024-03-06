import express from "express";
import cors from "cors";
import authRouter from "./src/routes/auth";
import messageRouter from "./src/routes/message";
import searchRouter from "./src/routes/search";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.use("/auth", authRouter);
app.use("/message", messageRouter);
app.use("/search", searchRouter);

app.get("/", (_, res) => {
  res.send("Zela API Online!");
});

app.listen(port, () => {
  console.log(`Zela app listening at http://localhost:${port}`);
});
