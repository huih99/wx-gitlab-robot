/*
 * @Author: TanHui
 * @Date: 2021-04-13 10:15:29
 * @LastEditors: TanHui
 * @LastEditTime: 2021-07-27 17:20:09
 * @Description:项目打包,目前采取TS编译加复制关键文件的方式，不采用打包工具打包
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require("child_process");
const copyfiles = require("copyfiles");

const packageFiles = ["package.json", "yarn.lock", "pm2.json"];
const destination = ["out"];

const promiseCp = function (files, destination, options = {}) {
  return new Promise((resolve, reject) => {
    copyfiles(files.concat(destination), options, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

async function build() {
  await promiseCp(packageFiles, destination);
  // typescript 编译
  const ts = spawn("npx tsc", { shell: true, stdio: "inherit" });
  ts.on("close", code => {
    if (code === 0) {
      console.log("✅ 代码打包成功");
    }
  });
}
build();
