/*
 * @Author: TanHui
 * @Date: 2021-07-26 15:59:32
 * @LastEditors: TanHui
 * @LastEditTime: 2021-07-27 17:16:02
 * @Description:
 */

/* eslint-disable no-unused-vars */
declare function pinyin(
  pinyin: string,
  options: { [k: string]: any }
): string[][];
// eslint-disable-next-line no-redeclare
declare namespace pinyin {
  export const STYLE_NORMAL: number;
}

declare module "pinyin" {
  export = pinyin;
}
