/*
 * @Author: TanHui
 * @Date: 2021-08-24 13:18:49
 * @LastEditors: TanHui
 * @LastEditTime: 2021-08-25 13:29:07
 * @Description:
 */
import { sendMdMessage } from "../../utils/wechatUtil";
import { usernameToUserid, getCrList, crNameToUserid } from "../../utils";
import md from "../../utils/markdown";
import { queryOpenedMergeRequests } from "../../config/gitlabApi";
import projectKeys from "../../config/projectKeys";

type PromiseType<T> = T extends Promise<infer P> ? P : any;

interface TodoMergeRequest {
  robotKey: string;
  title: string;
  author: string;
  crList: string[];
  web_url: string;
}
/**
 * 判断是否当天创建的Mr
 * @param createdTime 创建时间
 */
function isTimeout(createdTime: string): boolean {
  const curDate = new Date();
  const createdDate = new Date(createdTime);
  const curDateNum = Number(
    "" + curDate.getFullYear() + curDate.getMonth() + curDate.getDate()
  );
  const createdDateNum = Number(
    "" +
      createdDate.getFullYear() +
      createdDate.getMonth() +
      createdDate.getDate()
  );
  return curDateNum > createdDateNum;
}

function mentionTodo(todoMrs: TodoMergeRequest[]) {
  // 先按企业微信机器人key分组
  const mrsGroups: { [k: string]: TodoMergeRequest[] } = {};
  const robotKeys: string[] = [];
  todoMrs.forEach(item => {
    if (!mrsGroups[item.robotKey]) {
      robotKeys.push(item.robotKey);
      mrsGroups[item.robotKey] = [];
    }
    mrsGroups[item.robotKey].push(item);
  });

  robotKeys.forEach(robotKey => {
    const markdown = md("待办MR事项提醒").newLine();
    mrsGroups[robotKey].forEach((mr, idx, self) => {
      markdown
        .continue(`${idx + 1}、`)
        .quote()
        .continue(mr.title)
        .link(mr.web_url)
        .join(" ");
      mr.crList.map(item => {
        markdown.continue(item).mark();
      });
      markdown.newLine();
      if (idx < self.length - 1) {
        markdown.continue("").quote().newLine();
      }
    });
    sendMdMessage(robotKey, markdown.toString());
  });
}

async function queryTodoMergeRequests(): Promise<void> {
  const promises: Promise<{
    robotKey: string;
    mrs: PromiseType<ReturnType<typeof queryOpenedMergeRequests>>;
  }>[] = [];

  Object.keys(projectKeys).forEach(key => {
    promises.push(
      new Promise((resolve, reject) => {
        queryOpenedMergeRequests(projectKeys[key].id)
          .then(mrs => {
            resolve({ robotKey: projectKeys[key].key, mrs });
          })
          .catch(reject);
      })
    );
  });

  const openedProjectMrs = await Promise.all(promises);
  const promises1: Promise<TodoMergeRequest>[] = [];
  openedProjectMrs.forEach(item => {
    item.mrs.forEach(async mr => {
      if (isTimeout(mr.created_at)) {
        promises1.push(
          new Promise((resolve, reject) => {
            const crList = getCrList(mr.description);
            crNameToUserid(crList)
              .then(crIds => {
                resolve({
                  robotKey: item.robotKey,
                  crList: crIds,
                  author: usernameToUserid(mr.author.name),
                  web_url: mr.web_url,
                  title: mr.title
                });
              })
              .catch(reject);
          })
        );
      }
    });
  });

  const todoMrs: TodoMergeRequest[] = await Promise.all(promises1);
  mentionTodo(todoMrs);
}
/*
cron style rule:
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
*/

// 每天的10点0分0秒执行任务
queryTodoMergeRequests.rule = "0 0 10 * * *";

export default queryTodoMergeRequests;
