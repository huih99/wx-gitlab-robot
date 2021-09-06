/*
 * @Author: TanHui
 * @Date: 2021-04-09 11:30:41
 * @LastEditors: TanHui
 * @LastEditTime: 2021-07-27 13:31:15
 * @Description:
 */
import { EVENT_ACTION, EVENT_TYPE } from "../../../../config/gitlabEvent";
import {
  queryUserInfo,
  queryUserInfoByUsername
} from "../../../../config/gitlabApi";
import { getCrList, usernameToUserid } from "../../../../utils";
import md from "../../../../utils/markdown";

interface Label {
  id: number;
  title: string;
  color: string;
  project_id: number;
  created_at: string;
  updated_at: string;
  template: boolean;
  description: string;
  type: string;
  group_id: number;
}

export interface MergeRequestEvent {
  object_kind: "merge_request";
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
    homepage: string;
    url: string;
    ssh_url: string;
    http_url: string;
  };
  repository: {
    name: string;
    url: string;
    description: string;
    homepage: string;
  };
  object_attributes: {
    id: number;
    target_branch: string;
    source_branch: string;
    source_project_id: number;
    author_id: number;
    assignee_id: number;
    title: string;
    created_at: string;
    updated_at: string;
    milestone_id: null;
    state: string;
    merge_status: string;
    target_project_id: number;
    iid: number;
    description: string;
    source: {
      name: string;
      description: string;
      path_with_namespace: string;
      default_branch: "master";
    };
    target: {
      name: string;
      description: string;
      path_with_namespace: string;
      default_branch: string;
    };
    last_commit: {
      id: string;
      title: string;
      message: string;
      timestamp: string;
      url: string;
      author: {
        name: string;
        email: string;
      };
    };
    url: string;
    action: string;
    assignee: {
      name: string;
      username: string;
      avatar_url: string;
    };
  };
  changes: {
    updated_at: {
      previous: string;
      current: string;
    };
    labels: {
      previous: Label[];
      current: Label[];
    };
  };
}
async function crNameToUserid(crList: string[]) {
  const promises = crList.map(username => {
    return queryUserInfoByUsername(username);
  });
  const users = await Promise.all(promises);
  return users.map(user => usernameToUserid(user[0].name));
}

function mentionCodeReview(
  crList: string[],
  title: string,
  projectName: string,
  user: MergeRequestEvent["user"],
  url: string
) {
  const userId = usernameToUserid(user.name);
  const content =
    crList.map(item => md(item).mark()).join(" ") +
    md().newLine() +
    "您有新的 Code Review 订单：" +
    md(title).info().newLine() +
    md(` 项目：${projectName}`).quote().newLine() +
    md(` 发起人： ${md(userId).mark()}`)
      .quote()
      .newLine() +
    md(" 开始 Code Review").link(url).quote();

  return content;
}

async function mentionCodeReviewUpdate(
  crList: string[],
  title: string,
  projectName: string,
  author_id: number,
  url: string,
  last_commit: MergeRequestEvent["object_attributes"]["last_commit"]
) {
  const user = await queryUserInfo(author_id);
  const { title: commitTitle, url: commitUrl } = last_commit || {};
  const content =
    crList.map(item => md(item).mark()).join(" ") +
    md().newLine() +
    "您的 Code Review 订单有更新：" +
    md(title).info().newLine() +
    md(" 最新 commit: " + md(commitTitle).link(commitUrl))
      .quote()
      .newLine() +
    md(` 项目： ${projectName}`).quote().newLine() +
    md(` 发起人：${md(usernameToUserid(user.name)).mark()}`)
      .quote()
      .newLine() +
    md(` 开始 Code Review`).link(url).quote();
  return content;
}

/**
 * 发生MR变化时的提醒
 * @param {string} title 本次消息的标题
 * @param {object} project 项目信息
 * @param {string} description 本次提醒的描述信息
 * @param {string} url 对应消息可访达的url地址
 * @param {object} author 作者信息
 * @param {string[]} mentionList 需要提醒的用户
 * @param {number[]} mentionIdList 需要提醒的用户的gitlabId
 * @returns markdown
 */
async function mentionAssignee(
  title: string,
  project: MergeRequestEvent["project"],
  description: string,
  url: string,
  author: { type: string; name?: string; id: number },
  mentionList: string[],
  mentionIdList: number[]
) {
  if (!author.name) {
    const authorDetails = await queryUserInfo(author.id);
    author.name = authorDetails.name;
  }
  const mentionUsers = mentionList ? [...mentionList] : [];
  mentionIdList = [...new Set(mentionIdList)];
  for (const id of mentionIdList) {
    if (id) {
      const userInfo = await queryUserInfo(id);
      mentionUsers.push(usernameToUserid(userInfo.name));
    }
  }

  const content =
    "" +
    md(mentionUsers.map(user => md(user).mark()).join(" "))
      .newLine()
      .join(`${title}: `) +
    md(description).info().newLine() +
    md(` 项目：${project.name}`).quote().newLine() +
    md(` ${author.type}：${author.name}`).newLine() +
    md("查看").link(url).quote();
  return content;
}

async function mergeRequestHook(
  data: MergeRequestEvent
): Promise<{ markdown?: string; description: string }> {
  const {
    project = {} as MergeRequestEvent["project"],
    object_attributes = {} as MergeRequestEvent["object_attributes"],
    user,
    changes = {} as MergeRequestEvent["changes"] // 信息变更
  } = data;
  const {
    description,
    title,
    url,
    action,
    state,
    last_commit = {} as MergeRequestEvent["object_attributes"]["last_commit"],
    assignee_id,
    author_id
  } = object_attributes;
  // 获取 code review 人员列表
  const crList = [...new Set([...getCrList(description)])];
  const MERGE_REQUEST_ACTIONS = EVENT_ACTION[EVENT_TYPE.MERGE_REQUEST];

  if (state === "closed") {
    return { description: "该Merge Request已被关闭，忽略此条信息" };
  }
  // eslint-disable-next-line no-prototype-builtins
  if (!MERGE_REQUEST_ACTIONS.hasOwnProperty(action)) {
    throw new Error(`无法识别的action类型：${action}`);
  }

  if (
    action === MERGE_REQUEST_ACTIONS.open ||
    action === MERGE_REQUEST_ACTIONS.reopen
  ) {
    //   如果没有@ cr,则直接提醒合并
    if (!crList.length) {
      const markdown = await mentionAssignee(
        "您有一个新的Merge Request待处理",
        project,
        title,
        url,
        { type: "发起人", id: author_id },
        [],
        [assignee_id]
      );
      return {
        markdown,
        description: "没有 Code Reviewer，不进行CodeReview通知"
      };
    }
    const crUseridList = await crNameToUserid(crList);
    const markdown = mentionCodeReview(
      crUseridList,
      title,
      project.name,
      user,
      url
    );
    return { markdown, description: "已发起Code Review通知" };
  }
  // 该MR已被合并
  if (action === MERGE_REQUEST_ACTIONS.merge) {
    const markdown = await mentionAssignee(
      "您有一个Merge Request被成功合并",
      project,
      title,
      url,
      { type: "操作者", name: user.name, id: user.id },
      [],
      [author_id]
    );
    return { markdown, description: "已发起MR merged通知" };
  }

  if (action === MERGE_REQUEST_ACTIONS.update) {
    // 更新 label, title 则不进行提示
    const { labels } = changes;
    if (labels) {
      return { description: `更新 label 或 title` };
    }
    let markdown;
    if (crList.length > 0) {
      const crUseridList = await crNameToUserid(crList);
      markdown = await mentionCodeReviewUpdate(
        crUseridList,
        title,
        project.name,
        author_id,
        url,
        last_commit
      );
    } else {
      markdown = await mentionAssignee(
        "您有一个待处理的Merge Request有更新",
        project,
        title,
        url,
        { type: "发起人", name: user.name, id: user.id },
        [],
        [assignee_id]
      );
    }
    return { markdown, description: "已发起MR Update 通知" };
  }
  return { description: `action：${action}，暂无对应处理程序` };
}

export default mergeRequestHook;
