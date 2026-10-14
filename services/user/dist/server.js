import dotenv from "dotenv";
dotenv.config({
    quiet: true
});
import express from "express";
const app = express();
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log("server is running", PORT);
});
//# sourceMappingURL=server.js.map