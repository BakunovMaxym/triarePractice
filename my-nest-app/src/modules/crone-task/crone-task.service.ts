import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { UserTask } from '../user-tasks/entities/user-task.entity';
import { CronJob } from 'cron';
import { TaskStatus } from '../../constants/status-type';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

@Injectable()
export class CroneTaskService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly mailService: MailerService,
    @InjectRepository(UserTask)
    private readonly userTaskRepository: Repository<UserTask>,
  ) { }

  async expireUserTask(userTask: UserTask) {
    if (!userTask.deadline) {
        console.warn('Deadline is undefined for userTask:', userTask.id);
        return;
    }

    console.log("inside func");
    console.log(userTask.deadline);
    const job = new CronJob(userTask.deadline, async () => {
      if ((userTask.status === TaskStatus.ACCEPTED || userTask.status === TaskStatus.REJECTED) && userTask.deadline <= new Date()) {
        userTask.status = TaskStatus.EXPIRED;

        try {
          await this.mailService.sendMail({
            to: `${userTask.student.email}`,
            subject: "Протерміноване завдання",
            html: `
                            <h1>${userTask.task.course.name}</h1>
                            <p>Ви протермінували завдання <strong>${userTask.task.name}</strong>, виконайте його та швидше здавайте</p>`
          })
        } catch (err) {
          console.log(err);
        }
        await this.userTaskRepository.save(userTask);
      }
      this.schedulerRegistry.deleteCronJob(`deadline-${userTask.student.id}`);
    })
    this.schedulerRegistry.addCronJob(`deadline-${userTask.student.id}`, job);
    job.start();
  }
}