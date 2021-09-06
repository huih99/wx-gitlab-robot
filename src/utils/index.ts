/*
 * @Author: TanHui
 * @Date: 2021-04-09 13:51:47
 * @LastEditors: TanHui
 * @LastEditTime: 2021-08-24 14:42:30
 * @Description: 公共方法库
 */

import pinyin from "pinyin";
import { queryUserInfoByUsername } from "../config/gitlabApi";

/**
 * 将中文名转为userid
 * 名称在3个字以下时，使用名称全拼，否则使用姓全拼加名首字母
 * @param {string} chineseName 中文名
 * @return {string} userid
 */
export const usernameToUserid = function (chineseName: string): string {
  if (!chineseName) {
    return "";
  }
  const splitNames = chineseName.split("-");
  const truthName = splitNames.pop();
  const pyNames = pinyin(truthName!, { style: pinyin.STYLE_NORMAL });
  // 如果名字最后是数字，则该数字为编号
  let nameCode = "";
  let userid = "";
  if (/\d+/.test(pyNames[pyNames.length - 1][0])) {
    nameCode = pyNames.pop()![0];
  }
  if (pyNames.length < 3) {
    userid = pyNames.reduce((acc, val) => {
      return acc + val[0];
    }, "");
  } else {
    pyNames.forEach((v, i) => {
      if (i === 0) {
        userid += v[0];
      } else {
        const firstLetter = v[0].substr(0, 1);
        const secondLetter = v[0].substr(1, 1);

        userid += firstLetter;
        // 说明是翘舌音字，则取其声母部分作为首字母,例如z, zh
        if (secondLetter === "h") {
          userid += secondLetter;
        }
      }
    });
  }
  return userid + nameCode;
};

/**
 * 获取 MR描述中@ 的对象
 * @param {string} description mr 描述
 */
export const getCrList = (description = ""): string[] => {
  const atReg = /@[^\s]+/g;
  return (description.match(atReg) || []).map(assignee => assignee.slice(1));
};

/**
 * 将用户的username转换为企业微信中userid
 * @param crList Mr描述中@ 的用户
 * @returns
 */
export const crNameToUserid = async (crList: string[]): Promise<string[]> => {
  const promises = crList.map(username => {
    return queryUserInfoByUsername(username);
  });
  const users = await Promise.all(promises);
  return users.map(user => usernameToUserid(user[0].name));
};
