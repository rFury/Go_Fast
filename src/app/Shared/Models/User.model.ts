import { Company } from "./Company.model";
import { Group } from "./Group.model";
import { UserFeature, UserFeatureExpress } from "./UserFeature.model";


export class User {
  _id?: string;
  companyId?: Company;
  username?: string;
  name?: string;
  type?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  email?: string;
  password?: string;
  groupId?: Group;
  status?: string;
  previousStatus?: string;
  userFeatures?:UserFeatureExpress[];
  userFeaturesFull?:UserFeature[];
  new ?: {
    value ?: boolean,
    password ?: boolean
  }
}
