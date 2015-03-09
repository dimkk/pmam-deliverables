/// <reference path="./typings/tsd.d.ts" />


declare module ap {

    interface IndexedCache{
        addEntity: Function;
        clear: Function;
        count: Function;
        first: Function;
        keys: Function;
        last: Function;
        nthEntity: Function;
        removeEntity: Function;
        toArray: Function;
        //Object with keys equaling ID and values being the individual list item
        [key: number]: ListItem;
    }

    interface ListItemCrudOptions{
        //TODO Implement
    }

    interface FieldDefinition {
        staticName:string;
        objectType:string;
        mappedName:string;
        readOnly?:boolean;
        required?:boolean;
        getDefinition?():string;
        getDefaultValueForType?():string;
        getMockData?(options?:Object):any;
    }

    interface ListItemVersion {
        //TODO Implement
    }

    interface WorkflowDefinition{
        name:string;
        instantiationUrl:string;
        templateId:string;
    }

    interface StartWorkflowParams{
        templateId?:string;
        workflowName?:string;
    }

    interface Choice{
        value:string;
    }

    interface MultiChoice{
        value:string[];
    }

    interface Lookup{
        lookupValue:string;
        lookupId:number;
    }

    interface User{
        lookupValue:string;
        lookupId:number;
    }

    interface UserMulti{
        value:User[];
    }

    interface JSON{
        value:Object;
    }

    interface Attachments{
        value:string[];
    }

    interface ListItem{
        id?:number;
        created?:Date;
        modified?:Date;
        author?:User;
        editor?:User;
        permMask?:string;
        uniqueId?:string;
        fileRef?:Lookup;

        deleteAttachment?(url:string): ng.IPromise<any>;
        deleteItem?( options?:ListItemCrudOptions ): ng.IDeferred<any>;
        getAttachmentCollection?(): ng.IDeferred<string[]>;
        getAvailableWorkflows?(): ng.IDeferred<WorkflowDefinition[]>;
        getFieldChoices?( fieldName:string ): string[];
        getFieldDefinition?( fieldName:string ): FieldDefinition;
        getFieldDescription?( fieldName:string ): string;
        getFieldLabel?( fieldName:string ): string;
        getFieldVersionHistory?(fieldNames:string[]): ng.IDeferred<ListItemVersion>;
        getFormattedValue?( fieldName:string, options:Object ): string;
        getLookupReference?( fieldName:string, lookupId:number ): ListItem;
        resolvePermissions?(): UserPermissionsObject;
        saveChanges?( options?:ListItemCrudOptions ): ng.IDeferred<ListItem>;
        saveFields?( fieldArray:string[], options?:ListItemCrudOptions ): ng.IDeferred<ListItem>;
        startWorkflow?(options:StartWorkflowParams): ng.IDeferred<any>;
        validateEntity?( options?:Object ): boolean;

        //Added by Model Instantiation
        getModel?():Model;
        getList?():List;
        getListId?():string;
    }

    interface List{
        guid:string;
        title:string;
        customFields:FieldDefinition[];
        getListId?():string;
        identifyWebURL?():string;
        //viewFields?:string;
        //private fields?:FieldDefinition[];
        //isReady?:boolean;
        webURL?:string;
    }

    interface Model{
        factory:Function;
        list:List;

        addNewItem?( entity:ListItem, options?:Object ): ng.IDeferred<ListItem>;
        createEmptyItem?(overrides?:Object): ListItem;
        executeQuery?(queryName?:string, options?:Object): ng.IDeferred<IndexedCache>;
        extendListMetadata?(options:Object): ng.IDeferred<any>;
        generateMockData?(options?:Object): ListItem[];
        getAllListItems?(): ng.IDeferred<IndexedCache>;
        getCache?(queryName:string): Cache;
        getCachedEntity?(entityId:number): ListItem;
        getCachedEntities?(): IndexedCache;
        getFieldDefinition?(fieldName:string): FieldDefinition;
        getListItemById?(entityId:number, options?:Object): ng.IDeferred<ListItem>;
        getQuery?(queryName:string): Query;
        isInitialised?(): boolean;
        resolvePermissions?(): UserPermissionsObject;
        registerQuery?(queryOptions:QueryOptions): void;
        validateEntity?(entity:ListItem, options?:Object): boolean;
    }

    interface DiscussionThread{
        posts:DiscussionThreadPost[];
        nextId:number;
        getNextId():number;
        createPost(parentId:number,content:string):DiscussionThreadPost;
        getListItem():ListItem;
        prune():void;
        saveChanges():ng.IDeferred<ListItem>;
    }

    interface DiscussionThreadPost{
        content:string;
        id:number;
        parentId:number;
        created:Date;
        user:User;
        removePost():void;
        deletePost():ng.IDeferred<ListItem>;
        savePost():ng.IDeferred<ListItem>;
        reply():ng.IDeferred<ListItem>;
    }

    interface Cache{
        //TODO Populate me!
    }

    interface Query{
        execute?(options?:Object):IndexedCache;
        operation?:string;
        cacheXML?:boolean;
        offlineXML?:string;
        query?:string;
        queryOptions?:string;
    }

    interface QueryOptions{
        name?:string;
        operation?:string;
    }

    interface UserPermissionsObject{
        ViewListItems:boolean;
        AddListItems:boolean;
        EditListItems:boolean;
        DeleteListItems:boolean;
        ApproveItems:boolean;
        OpenItems:boolean;
        ViewVersions:boolean;
        DeleteVersions:boolean;
        CancelCheckout:boolean;
        PersonalViews:boolean;
        ManageLists:boolean;
        ViewFormPages:boolean;
        Open:boolean;
        ViewPages:boolean;
        AddAndCustomizePages:boolean;
        ApplyThemeAndBorder:boolean;
        ApplyStyleSheets:boolean;
        ViewUsageData:boolean;
        CreateSSCSite:boolean;
        ManageSubwebs:boolean;
        CreateGroups:boolean;
        ManagePermissions:boolean;
        BrowseDirectories:boolean;
        BrowseUserInfo:boolean;
        AddDelPrivateWebParts:boolean;
        UpdatePersonalWebParts:boolean;
        ManageWeb:boolean;
        UseRemoteAPIs:boolean;
        ManageAlerts:boolean;
        CreateAlerts:boolean;
        EditMyUserInfo:boolean;
        EnumeratePermissions:boolean;
        FullMask:boolean;
    }

}
