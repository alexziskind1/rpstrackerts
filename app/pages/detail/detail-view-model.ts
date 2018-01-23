import * as app from "application";
import { Observable, PropertyChangeData } from "data/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { PtItem } from "../../core/models/domain";
import { PtItemType } from "../../core/models/domain/types";
import { ItemType } from "../../core/constants/pt-item-types";
import { BacklogService } from "../../services/backlog-service";
import { Button } from "ui/button";
import {
    PT_ITEM_STATUSES,
    PT_ITEM_PRIORITIES,
    COLOR_LIGHT,
    COLOR_DARK
} from "../../core/constants";
import {
    ButtonEditorHelper,
    setMultiLineEditorFontSize,
    setPickerEditorImageLocation,
    setStepperEditorTextPostfix,
    setStepperEditorContentOffset,
    setStepperEditorColors,
    setSegmentedEditorColor,
    getPickerEditorValueText
} from "./helpers/ui-data-form";
import { CustomPropertyEditor } from "nativescript-pro-ui/dataform";
import { Routes } from "../../shared/routes";

export class DetailViewModel extends Observable {
    backlogService: BacklogService;
    item: PtItem;
    selectedScreen: string;
    form;
    formMetaData = {
        isReadOnly: false,
        commitMode: "Immediate",
        validationMode: "Immediate",
        propertyAnnotations: [
            {
                name: "title",
                displayName: "Title",
                index: 1
            },
            {
                name: "description",
                displayName: "Description",
                index: 2
            },
            {
                name: "type",
                displayName: "Type",
                index: 3,
                editor: "Picker",
                valuesProvider: ItemType.List.map(t => t.PtItemType)
            },
            {
                name: "status",
                displayName: "Status",
                index: 4,
                editor: "Picker",
                valuesProvider: PT_ITEM_STATUSES
            },
            {
                name: "estimate",
                displayName: "Estimate",
                index: 5,
                editor: "Stepper",
                minimum: 1,
                maximum: 10,
                step: 1
            },
            {
                name: "priority",
                displayName: "Priority",
                index: 6,
                editor: "SegmentedPicker",
                valuesProvider: PT_ITEM_PRIORITIES
            }
        ]
    };

    private itemTypeEditorBtnHelper: ButtonEditorHelper;
    private itemTypeEditorViewConnected = false;
    private itemTypeNativeView;

    constructor(item) {
        super();
        this.item = item;
        this.form = {
            title: item.title,
            description: item.description,
            type: item.type,
            status: item.status,
            estimate: item.estimate,
            priority: item.priority,
            assigneeName: item.assigneeName
        };

        this.selectedScreen = "details";
        this.backlogService = new BacklogService();
    }

    onPropertyCommitted() {
        this.item.title = this.form.title;
        this.item.description = this.form.description;
        this.item.type = this.form.type;
        this.item.status = this.form.status;
        this.item.estimate = this.form.estimate;
        this.item.priority = this.form.priority;
        this.backlogService.updatePtItem(this.item);
    }

    onAssigneeSelect(args) {
        const page = args.object.page;
        page.showModal(
            Routes.assigneeSelectorModal,
            {},
            assignee => {
                if (assignee) {
                    this.item.assignee = assignee;
                    page.getViewById("assigneeBtn").text = assignee.fullName;
                    page.getViewById("assigneeImg").src = assignee.avatar;
                    this.onPropertyCommitted();
                }
            },
            true
        );
    }
}