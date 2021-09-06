/*
 * @Author: TanHui
 * @Date: 2021-04-09 17:42:56
 * @LastEditors: TanHui
 * @LastEditTime: 2021-07-26 15:53:37
 * @Description: 各项目微信机器人key
 */
export interface ProjectKeys {
  [k: string]: {
    id: number;
    key: string;
  };
}
const projectKeys: ProjectKeys = {
  // 项目配置
  "project name": {
    id: 0, // project id, 在仓库的web页面中可以看到
    key: "robot key" // 企业微信机器人key
  },
};
export default projectKeys;
