import { appStore } from '~/core/app-store';
import { PtBacklogRepository } from '~/core/contracts/repositories/pt-backlog-repository.contract';
import {
  CreateItemRequest,
  DeleteItemRequest,
  FetchItemsRequest,
  UpdateItemRequest
} from '~/core/contracts/requests/backlog';
import {
  CreateItemResponse,
  DeleteItemResponse,
  FetchItemsResponse,
  UpdateItemResponse
} from '~/core/contracts/responses/backlog';
import { PtBacklogService } from '~/core/contracts/services/pt-backlog-service.contract';
import { PtItem } from '~/core/models/domain';
import { PriorityEnum, StatusEnum } from '~/core/models/domain/enums';
import { PresetType } from '~/core/models/types';
import { setUserAvatar } from '~/core/services/avatar.service';

export class BacklogService implements PtBacklogService {
  constructor(private backlogRepo: PtBacklogRepository) {}

  public getCurrentPreset(): PresetType {
    return appStore.value.selectedPreset;
  }

  public setPreset(preset): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (appStore.value.selectedPreset !== preset) {
        appStore.set('selectedPreset', preset);
        resolve();
      }
    });
  }

  public fetchItems(
    fetchItemsRequest: FetchItemsRequest
  ): Promise<FetchItemsResponse> {
    return new Promise<FetchItemsResponse>((resolve, reject) => {
      this.backlogRepo.fetchPtItems(
        fetchItemsRequest.getCurrentPreset(),
        fetchItemsRequest.getCurrentUserId(),
        error => {
          reject(error);
        },
        (ptItems: PtItem[]) => {
          ptItems.forEach(i => {
            setUserAvatar(this.backlogRepo.apiEndpoint, i.assignee);
            i.comments.forEach(c =>
              setUserAvatar(this.backlogRepo.apiEndpoint, c.user)
            );
          });

          appStore.set('backlogItems', ptItems);
          const response: FetchItemsResponse = {
            items: ptItems
          };
          resolve(response);
        }
      );
    });
  }

  public addNewPtItem(
    createItemRequest: CreateItemRequest
  ): Promise<CreateItemResponse> {
    const item: PtItem = {
      id: 0,
      title: createItemRequest.newItem.title,
      description: createItemRequest.newItem.description,
      type: createItemRequest.newItem.type,
      estimate: 0,
      priority: PriorityEnum.Medium,
      status: StatusEnum.Open,
      assignee: createItemRequest.assignee,
      tasks: [],
      comments: [],
      dateCreated: new Date(),
      dateModified: new Date()
    };

    return new Promise((resolve, reject) => {
      this.backlogRepo.insertPtItem(
        item,
        error => {
          reject(error);
          console.dir(error);
        },
        (nextItem: PtItem) => {
          setUserAvatar(this.backlogRepo.apiEndpoint, nextItem.assignee);

          appStore.set('backlogItems', [
            nextItem,
            ...appStore.value.backlogItems
          ]);

          const response: CreateItemResponse = {
            createdItem: nextItem
          };

          resolve(response);
        }
      );
    });
  }

  public updatePtItem(
    updateItemRequest: UpdateItemRequest
  ): Promise<UpdateItemResponse> {
    return new Promise<UpdateItemResponse>((resolve, reject) => {
      this.backlogRepo.updatePtItem(
        updateItemRequest.itemToUpdate,
        error => {
          reject(error);
          console.dir(error);
        },
        (updatedItem: PtItem) => {
          const response: UpdateItemResponse = {
            updatedItem: updatedItem
          };
          resolve(response);
        }
      );
    });
  }

  public deletePtItem(
    deleteItemRequest: DeleteItemRequest
  ): Promise<DeleteItemResponse> {
    return new Promise<DeleteItemResponse>((resolve, reject) => {
      this.backlogRepo.deletePtItem(
        deleteItemRequest.itemToDelete.id,
        error => {
          reject(error);
          console.dir(error);
        },
        () => {
          const updatedItems = appStore.value.backlogItems.filter(i => {
            return i.id !== deleteItemRequest.itemToDelete.id;
          });
          appStore.set('backlogItems', updatedItems);

          const response: DeleteItemResponse = {
            deleted: true
          };

          resolve(response);
        }
      );
    });
  }
}
