/*
 * @Author: TanHui
 * @Date: 2021-08-24 13:20:19
 * @LastEditors: TanHui
 * @LastEditTime: 2021-08-25 14:28:47
 * @Description: 定时任务管理，采用统一的约定方式，即每个定时任务需要导出一个函数，且该函数上必须包含一个rule属性
 */
import schedule from "node-schedule";
import path from "path";
import requireAll from "../../utils/requireAll";

interface Scheduler {
  (fireDate: Date): any;
  rule: any;
}

// 引入当前目录下除自身外的所有文件
requireAll(__dirname, [path.basename(__filename)], modules => {
  scheduleJobs(modules);
});

function scheduleJobs(schedulers: Scheduler[]) {
  schedulers.forEach(scheduler => {
    schedule.scheduleJob(scheduler.rule, scheduler);
  });
}
