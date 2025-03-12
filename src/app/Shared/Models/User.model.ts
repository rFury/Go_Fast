import { Company } from "./Company.model";
import { Group } from "./Group.model";


export class User {
  id?: string;
  _id?: string;
  companyId!: Company;
  name?: string;
  avatar?: string;
  email?: string;
  password?: string;
  groupsId?: Group;
  status?: string;
}

export class ResToken {
  token?: string;
}
