/*
 * @Author: TanHui
 * @Date: 2021-04-09 09:56:18
 * @LastEditors: TanHui
 * @LastEditTime: 2021-08-24 14:08:46
 * @Description:
 */
import axios, { AxiosRequestConfig } from "axios";
import { GITLAB_ACCESS_TOKEN, GITLAB_API_V4 } from "../appConfig";

const request = axios.create({
  baseURL: GITLAB_API_V4,
  timeout: 30000,
  headers: { "Private-Token": GITLAB_ACCESS_TOKEN }
});

request.interceptors.response.use(response => {
  if (response.status === 200) {
    return response.data;
  }
  throw new Error(response.status + ": 不正确的状态码");
});

// 解决使用拦截器后，无法正确识别axios请求的返回类型问题
interface Ajax {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

const ajax: Ajax = function (url: string, config?: AxiosRequestConfig) {
  return request(url, config);
};

ajax.get = function (url, config) {
  return request.get(url, config);
};

export interface UserInfo {
  id: number;
  name: string;
  username: string;
  state: string;
  avatar_url: string;
  web_url: string;
  created_at: string;
  bio: string;
  location: string;
  public_email: string;
  skype: string;
  linkedin: string;
  twitter: string;
  website_url: string;
  organization: string;
  job_title: string;
  work_information: string | null;
}

interface Comment {
  body: string;
  author: { username: string; id: number };
}

interface MergeRequest {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  description: string;
  state: string;
  web_url: string;
  author: {
    name: string;
    username: string;
  };
  assignee: {
    id: string;
    name: string;
    username: string;
  };
}

/**
 * 查询用户信息
 * @param {number} id 用户 ID
 */
export const queryUserInfo = (id: number): Promise<UserInfo> => {
  return ajax.get<UserInfo>(`/users/${id}`);
};

/**
 * 查询用户信息
 * @param {string} username 用户名
 * @returns
 */
export const queryUserInfoByUsername = (
  username: string
): Promise<UserInfo[]> => {
  return ajax.get<UserInfo[]>(`/users?username=${username}`);
};
/**
 * 查询 mr 的 comment
 * @param {number} projectId 项目 ID
 * @param {number} mrIid merge_request_iid
 */
export const queryMrComments = (
  projectId: number,
  mrIid: number
): Promise<Comment[]> => {
  return ajax.get<Comment[]>(
    `/projects/${projectId}/merge_requests/${mrIid}/notes`
  );
};

/**
 * 获取项目下打开的MergeRequest
 * @param projectId 项目id
 * @returns {MergeRequest[]}
 */
export const queryOpenedMergeRequests = (
  projectId: number
): Promise<MergeRequest[]> => {
  return ajax.get<MergeRequest[]>(
    `/projects/${projectId}/merge_requests?state=opened`
  );
};
