import { Company } from "./Company.model";
import { Group } from "./Group.model";


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

}

export class ResToken {
  token?: string;
}
