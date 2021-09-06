/*
 * @Author: TanHui
 * @Date: 2021-08-25 13:30:41
 * @LastEditors: TanHui
 * @LastEditTime: 2021-08-25 14:14:24
 * @Description: 引入目录下所有模块
 */

import * as fs from "fs";
import * as path from "path";

function requireAll(dir: string): void;
function requireAll(dir: string, except: string[] | RegExp): void;
function requireAll(dir: string, callback: (modules: any[]) => void): void;
function requireAll(
  dir: string,
  except: string[] | RegExp,
  callback: (modules: any[]) => void
): void;
function requireAll(
  dir: string,
  except?: string[] | RegExp | ((modules: any[]) => void),
  callback?: (modules: any[]) => void
): void {
  if (typeof except === "function") {
    callback = except;
    except = void 0;
  }
  fs.stat(dir, (err, stats) => {
    if (err) {
      return;
    }
    if (!stats.isDirectory()) {
      return;
    }
    fs.readdir(dir, (err, files) => {
      if (err) {
        return;
      }
      const modules: any[] = [];
      files.forEach(file => {
        if (except) {
          if (Array.isArray(except) && except.includes(file)) {
            return;
          }
          if (except instanceof RegExp && except.test(file)) {
            return;
          }
        }
        const modulePath = path.resolve(dir, file);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const module = require(modulePath);
        modules.push(module.default || module);
      });
      callback && callback(modules);
    });
  });
}

export default requireAll;
