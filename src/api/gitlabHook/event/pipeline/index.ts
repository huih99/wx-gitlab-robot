/*
 * @Author: TanHui
 * @Date: 2021-06-16 10:40:08
 * @LastEditors: TanHui
 * @LastEditTime: 2021-07-27 11:31:40
 * @Description: pipeline 事件支持
 */
import { usernameToUserid } from "../../../../utils";
import md from "../../../../utils/markdown";

export interface PipelineEvent {
  object_kind: "pipeline";
  object_attributes: {
    id: number;
    ref: string;
    tag: boolean;
    sha: string;
    before_sha: string;
    source: string;
    status: string;
    stages: string[];
    created_at: string;
    finished_at: string;
    duration: number;
    detailed_status: string;
  };
  user: {
    id: number;
    name: string;
    username: string;
    avatar_url: string;
    email: string;
  };
  project: {
    id: number;
    name: string;
    description: string;
    web_url: string;
    namespace: string;
    path_with_namespace: string;
    default_branch: string;
  };
  commit: {
    id: number;
    message: string;
    title: string;
    timestamp: string;
    url: string;
    author: {
      name: string;
      email: string;
    };
  };
}

function pipelineHook(
  data: PipelineEvent
): { description: string; markdown?: string } {
  const {
    project,
    object_attributes,
    user,
    commit = {} as PipelineEvent["commit"]
  } = data;
  //   pipeline运行成功
  const { id, ref, detailed_status } = object_attributes || {};
  if (detailed_status === "passed") {
    const userId = usernameToUserid(user.name);
    const pipelineUrl = `${project.web_url}/pipelines/${id}`;

    const markdown =
      "" +
      md(userId)
        .mark()
        .newLine()
        .join("pipeline运行成功")
        .newLine()
        .join(md(` 项目：${project.name}`).quote().toString())
        .newLine()
        .join(md(` 分支：${ref}`).quote().toString())
        .newLine()
        .join(
          md(" 最新提交：")
            .join(md(`${commit.title}`).info().toString())
            .quote()
            .toString()
        )
        .newLine()
        .join(md("查看").link(pipelineUrl).quote().toString());
    return { markdown, description: "已成功发起通知" };
  }
  return { description: "正在执行或者失败的pipeline不发起通知" };
}

export default pipelineHook;
