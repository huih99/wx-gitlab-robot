/*
 * @Author: TanHui
 * @Date: 2021-04-08 13:23:55
 * @LastEditors: TanHui
 * @LastEditTime: 2021-08-25 14:31:51
 * @Description:
 */

import express from "express";
import apiRegister from "./api";
import "./schedule";

const app = express();
app.use(express.json());
apiRegister(app);
app.get("/", function (req, res) {
  res.end("hello");
});
app.listen(process.env.server_port || 8080);
