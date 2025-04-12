import { Feature } from "./Feature.model";
import { User } from "./User.model";

export class UserFeature  {
    _id?:string;
    userId?: User;
    featureId?:Feature;
    title?:string;
    status: boolean;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    list?: boolean;
    defaultFeature?: boolean;
  }

export class UserFeatureExpress{
  _id?:string;
  code?:string;
  title?:string;
  icon?:string;
  status?:string;
  link?:string;
}