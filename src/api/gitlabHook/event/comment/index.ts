/*
 * @Author: TanHui
 * @Date: 2021-04-09 11:30:46
 * @LastEditors: TanHui
 * @LastEditTime: 2021-07-27 13:30:34
 * @Description:
 */
/**
 * 处理 comment 事件
 */

import md from "../../../../utils/markdown";

import { queryUserInfo, queryMrComments } from "../../../../config/gitlabApi";

import { getCrList, usernameToUserid } from "../../../../utils";

type BranchInfo = {
  name: string;
  description: string;
  web_url: string;
  git_ssh_url: string;
  git_http_url: string;
  namespace: string;
  visibility_level: number;
  path_with_namespace: string;
  default_branch: string;
  homepage: string;
  url: string;
  ssh_url: string;
  http_url: string;
};

export interface NoteEvent {
  object_kind: "note";
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
  };
  object_attributes: {
    id: number;
    note: string;
    noteable_type: string;
    author_id: number;
    created_at: string;
    updated_at: string;
    position: number;
    project_id: number;
    commit_id: string;
    noteable_id: number;
    system: boolean;
    url: string;
  };
  merge_request: {
    id: number;
    target_branch: string;
    source_branch: string;
    source_project_id: number;
    author_id: number;
    assignee_id: number;
    title: string;
    created_at: string;
    updated_at: string;
    milestone_id: number;
    state: string;
    merge_status: string;
    target_project_id: number;
    iid: number;
    description: string;
    position: number;
    source: BranchInfo;
    target: BranchInfo;
    url: string;
    last_commit: {
      id: string;
      message: string;
      timestamp: string;
      url: string;
      author: {
        name: string;
        email: string;
      };
    };
    assignee: {
      name: string;
      username: string;
      avatar_url: string;
    };
  };
}

export default async function (
  data: NoteEvent
): Promise<{ description: string; markdown?: string }> {
  const {
    object_attributes: objectAttributes = {} as NoteEvent["object_attributes"], // MR 基础信息
    user, // 本次事件发起人
    project, // MR 项目信息
    merge_request = {} as NoteEvent["merge_request"] // mr 信息
  } = data;
  const { position, note, url, noteable_type } = objectAttributes;
  // 暂时只支持 MergeRequest 相关
  if (noteable_type !== "MergeRequest")
    return {
      description: `本次 type 为 ${noteable_type} 暂时只支持 MergeRequest 相关 comment`
    };
  // 是否代码评论
  // 存在 position 字段即为代码评论
  const isCommentCode = !!position;
  const {
    author_id,
    assignee_id,
    description,
    iid,
    url: mrUrl
  } = merge_request;
  const { name, id: projectId } = project;
  const codeReviewer = getCrList(description);
  // 不存在 codeReviewer， 则不进行通知
  if (!codeReviewer.length) {
    return {
      description: `本次评论「${note}」，但不存在 code reviewer 暂时不进行通知`
    };
  }
  // MR的发起人信息
  const authorInfo = await queryUserInfo(author_id);
  const author = usernameToUserid(authorInfo.name);

  // 本此NOTE事件发起人
  const curUser = usernameToUserid(user.name);

  if (isCommentCode) {
    const markdown =
      md(author).mark().newLine() +
      "您的 merge request 有新的评论：" +
      md(note).warning().newLine() +
      md(`项目：${name}`).quote().newLine() +
      md("评论人：").join(md(curUser).mark().toString()).quote().newLine() +
      md(" 查看").link(url);
    return {
      description: "已发起MergeRequest新评论通知",
      markdown
    };
  }
  // 只需要 包含 done 或者 1 的 comment
  const reg = /^(done|1)$/;
  if (!reg.test(note))
    return {
      description: `本次评论「${note}」，但不是 code review 暂时不进行通知`
    };
  // 普通评论视为赞同
  const commentList = await queryMrComments(projectId, iid);

  // 过滤 comment
  const codeReviewerMap = commentList
    .filter(item => reg.test(item.body.trim()))
    .reduce((userCommentMap, comment) => {
      const {
        author: { username }
      } = comment;
      userCommentMap[username] = true;
      return userCommentMap;
    }, {} as { [k: string]: boolean });

  // 如果还有 code reviewer 未赞同，则不进行通知
  if (!codeReviewer.every(reviewer => codeReviewerMap[reviewer])) {
    return {
      description: `本次评论「${note}」，但是还未达到人数要求，不需要通知`
    };
  }
  let assignee;
  if (assignee_id) {
    const assigneeInfo = await queryUserInfo(assignee_id);
    assignee = usernameToUserid(assigneeInfo.name);
  }
  const mentionUsers = assignee ? [...new Set([author, assignee])] : [author];
  const markdown =
    mentionUsers.map(user => md(user).mark()).join(" ") +
    md().newLine() +
    "该 Merge Request 已经通过 Code Review: " +
    md(merge_request.title).info().newLine() +
    md(` 项目：${name}`).quote().newLine() +
    md(" 查看").link(mrUrl).quote();
  return {
    description: "已发起Merge Request通过 code review 的通知",
    markdown
  };
}
