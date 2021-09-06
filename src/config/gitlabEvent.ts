/*
 * @Author: TanHui
 * @Date: 2021-04-08 13:39:34
 * @LastEditors: TanHui
 * @LastEditTime: 2021-07-27 13:13:06
 * @Description:
 */

export const EVENT_TYPE = {
  MERGE_REQUEST: "merge_request",
  COMMENT: "note",
  PIPELINE: "pipeline"
};

export const EVENT_ACTION = {
  [EVENT_TYPE.MERGE_REQUEST]: {
    open: "open",
    reopen: "reopen",
    update: "update",
    merge: "merge"
  }
};
