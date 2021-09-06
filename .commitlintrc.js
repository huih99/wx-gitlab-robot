/*
 * @Author: TanHui
 * @Date: 2021-04-08 15:47:09
 * @LastEditors: TanHui
 * @LastEditTime: 2021-07-28 13:46:32
 * @Description:
 */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
        "version"
      ]
    ]
  }
};
