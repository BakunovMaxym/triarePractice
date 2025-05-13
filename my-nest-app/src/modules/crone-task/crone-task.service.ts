import { Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { UserTask } from '../user-tasks/entities/user-task.entity';
import { CronJob } from 'cron';
import { TaskStatus } from '../../constants/status-type';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, type Repository } from 'typeorm';

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
      console.log('Deadline is undefined for userTask:', userTask.id);
      return;
    }

    const job = new CronJob(userTask.deadline, async () => {
      if (!userTask.deadline) {
        console.log('Deadline is undefined for userTask:', userTask.id);
        return;
      }
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
      this.schedulerRegistry.deleteCronJob(`deadline-${userTask.id}`);
    })

    this.schedulerRegistry.addCronJob(`deadline-${userTask.id}`, job);
    job.start();
  }

  @Cron('0 0 0 * * *', {
    name: 'task-remainder',
    timeZone: 'Europe/Kyiv',
  })
  async spam() {
    const now = new Date();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const userTasks = await this.userTaskRepository.find({
      where: { deadline: Between(now, tomorrow), status: TaskStatus.ACCEPTED },
      relations: ['task', 'student'],
    })

    if (userTasks.length !== 0) {
      userTasks.forEach(async (userTask) => {
        try {
          await this.mailService.sendMail({
            to: `${userTask.student.email}`,
            subject: "Лагідне нагадування",
            html: `
                                <h1>${userTask.task.course.name}</h1>
                                <p>Завтра останній день здачі завдання <strong>${userTask.task.name}</strong>, о <strong>${userTask.deadline?.toLocaleTimeString()}</strong></p>`
          })
        } catch (err) {
          console.log(err);
        }
      })
    }

  }


}