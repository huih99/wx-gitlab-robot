/*
 * @Author: TanHui
 * @Date: 2021-04-09 11:30:31
 * @LastEditors: TanHui
 * @LastEditTime: 2021-07-27 13:32:00
 * @Description:
 */
import mergeRequestHook, { MergeRequestEvent } from "./mergeRequest";
import commentHook, { NoteEvent } from "./comment";
import pipelineHook, { PipelineEvent } from "./pipeline";
import { EVENT_TYPE } from "../../../config/gitlabEvent";

export type EventData = MergeRequestEvent | NoteEvent | PipelineEvent;
export default {
  [EVENT_TYPE.MERGE_REQUEST]: mergeRequestHook,
  [EVENT_TYPE.COMMENT]: commentHook,
  [EVENT_TYPE.PIPELINE]: pipelineHook
};
