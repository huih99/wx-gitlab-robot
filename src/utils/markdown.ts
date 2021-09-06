/*
 * @Author: TanHui
 * @Date: 2021-04-09 10:08:11
 * @LastEditors: TanHui
 * @LastEditTime: 2021-08-24 15:54:47
 * @Description: 企业微信 md 语法
 */

class Markdown {
  private val: string;
  private beforeValue: string;
  constructor(str: string) {
    this.val = str || "";
    this.beforeValue = "";
  }
  join(val: string) {
    this.val += val;
    return this;
  }
  newLine() {
    this.val = `${this.val}\n`;
    return this;
  }
  quote() {
    this.val = `>${this.val}`;
    return this;
  }
  bold() {
    this.val = `**${this.val}**`;
    return this;
  }
  info() {
    this.val = `<font color="info">${this.val}</font>`;
    return this;
  }
  warning() {
    this.val = `<font color="warning">${this.val}</font>`;
    return this;
  }
  comment() {
    this.val = `<font color="comment">${this.val}</font>`;
    return this;
  }
  link(href: string) {
    this.val = `[${this.val}](${href})`;
    return this;
  }
  mark() {
    this.val = `<@${this.val}>`;
    return this;
  }
  continue(str: string) {
    this.beforeValue += this.val;
    this.val = str;
    return this;
  }
  toString() {
    return this.beforeValue + this.val;
  }
  toJSON() {
    return this.beforeValue + this.val;
  }
}

function md(str = ""): Markdown {
  if (str && typeof str !== "string") {
    throw new Error("expected arg not string");
  }
  return new Markdown(str);
}

export default md;
