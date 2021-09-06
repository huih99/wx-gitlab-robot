/*
 * @Author: TanHui
 * @Date: 2021-04-08 13:36:11
 * @LastEditors: TanHui
 * @LastEditTime: 2021-07-27 13:37:51
 * @Description:
 */
import e from "express";
import gitlabHook from "./gitlabHook";

export default function apiRegister(app: e.Express): void {
  app.post("/gitlab_hook", gitlabHook);
}
