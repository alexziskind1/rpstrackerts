import { PtBacklogRepository } from '~/core/contracts/repositories/pt-backlog-repository.contract';
import {
  CreateTaskRequest,
  UpdateTaskRequest
} from '~/core/contracts/requests/backlog';
import {
  CreateTaskResponse,
  UpdateTaskResponse
} from '~/core/contracts/responses/backlog';
import { PtTaskService } from '~/core/contracts/services/pt-task-service.contract';
import { PtTask } from '~/core/models/domain';

export class TaskService implements PtTaskService {
  constructor(private backlogRepo: PtBacklogRepository) {}

  public addNewPtTask(
    createTaskRequest: CreateTaskRequest
  ): Promise<CreateTaskResponse> {
    const task: PtTask = {
      id: 0,
      title: createTaskRequest.newTask.title,
      completed: false,
      dateCreated: new Date(),
      dateModified: new Date()
    };

    return new Promise<CreateTaskResponse>((resolve, reject) => {
      this.backlogRepo.insertPtTask(
        task,
        createTaskRequest.currentItem.id,
        error => {
          // console.dir(error);
        },
        (nextTask: PtTask) => {
          const response: CreateTaskResponse = {
            createdTask: nextTask
          };
          resolve(response);
        }
      );
    });
  }

  public updatePtTask(
    updateTaskRequest: UpdateTaskRequest
  ): Promise<UpdateTaskResponse> {
    const task = updateTaskRequest.taskUpdate.task;
    const newTitle = updateTaskRequest.taskUpdate.newTitle;
    const toggle = updateTaskRequest.taskUpdate.toggle;

    const taskToUpdate: PtTask = {
      id: task.id,
      title: newTitle ? newTitle : task.title,
      completed: toggle ? !task.completed : task.completed,
      dateCreated: task.dateCreated,
      dateModified: new Date()
    };

    return new Promise<UpdateTaskResponse>((resolve, reject) => {
      this.backlogRepo.updatePtTask(
        taskToUpdate,
        updateTaskRequest.currentItem.id,
        error => {
          // console.dir(error);
        },
        (_updatedTask: PtTask) => {
          // do nothing
        }
      );
      const reponse: UpdateTaskResponse = {
        updatedTask: taskToUpdate
      };
      resolve(reponse);
    });
  }
}
