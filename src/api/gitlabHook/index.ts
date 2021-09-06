/*
 * @Author: TanHui
 * @Date: 2021-04-08 13:37:56
 * @LastEditors: TanHui
 * @LastEditTime: 2021-07-27 13:37:15
 * @Description:
 */
import {GITLAB_EVENT_TOKEN} from '../../appConfig'
import { EVENT_TYPE } from "../../config/gitlabEvent";
import { sendMdMessage } from "../../utils/wechatUtil";
import projectKeys from "../../config/projectKeys";

import events, { EventData } from "./event";
import { Request, Response } from "express";

function supportEventType(eventType: string) {
  return (Object.keys(EVENT_TYPE) as (keyof typeof EVENT_TYPE)[]).some(
    key => EVENT_TYPE[key] === eventType
  );
}

function getWechatKey(project: { name: string; id: number }) {
  let wechatKey;
  Object.keys(projectKeys).some(key => {
    const target = projectKeys[key];
    if (project.name === key && project.id === target.id) {
      wechatKey = target.key;
      return true;
    }
  });
  return wechatKey;
}

export default async function (req: Request, res: Response): Promise<void> {
  const sendError = (msg: string) => {
    res.setHeader("Content-Type", "text/plain;charset=utf-8");
    res.status(500).end(msg);
  };
  const gitlabToken = req.headers["x-gitlab-token"] || "";
  if (gitlabToken.indexOf(GITLAB_EVENT_TOKEN) < 0) {
    return sendError("token invalid");
  }
  const data = req.body as EventData;
  if (!data) {
    return sendError("response is empty");
  }
  const eventType = data.object_kind;
  if (!supportEventType(eventType)) {
    return sendError("not support the event type: " + eventType);
  }

  const wechatKey = getWechatKey(data.project);
  if (!wechatKey) {
    return sendError("未获取到有效的wechat key");
  }

  const handler = events[eventType];
  try {
    const result = await handler(data as any);
    if (result.markdown) {
      sendMdMessage(wechatKey, result.markdown);
    }
    res.setHeader("Content-Type", "text/plain;charset=utf-8");
    res.status(200).end(result.description);
  } catch (e) {
    const msg = e instanceof Error ? e.message : (e as string);
    sendError(msg);
  }
}
