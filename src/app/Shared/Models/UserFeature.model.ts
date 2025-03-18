export class UserFeature  {
    companyId?: string;
    userId?: string;
    featureId?: string;
    status: boolean;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    list?: boolean;
    defaultFeature?: boolean;
    usersCreation?: string;
    usersLastUpdate?:string;
  }