import { Feature } from "./Feature.model";
import { User } from "./User.model";

export class UserFeature  {
    _id?:string;
    companyId?: string;
    userId?: User;
    featureId?:Feature;
    status: boolean;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    list?: boolean;
    defaultFeature?: boolean;
    usersCreation?: User;
    usersLastUpdate?: User;
  }