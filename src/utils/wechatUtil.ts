/*
 * @Author: TanHui
 * @Date: 2021-04-12 13:31:23
 * @LastEditors: TanHui
 * @LastEditTime: 2021-08-24 13:18:09
 * @Description: 企业微信机器人消息发送
 */
import axios, { AxiosResponse } from "axios";
const prefixUrl = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send";

export function sendMdMessage(
  key: string,
  content: string,
  mentionList = [],
  mentionMobiles = []
): Promise<AxiosResponse> {
  const api = prefixUrl + "?key=" + key;

  return axios.post(api, {
    msgtype: "markdown",
    markdown: {
      content,
      mentioned_list: mentionList,
      mentioned_mobile_list: mentionMobiles
    }
  });
}
