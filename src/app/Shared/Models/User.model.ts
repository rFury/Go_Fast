import { Company } from "./Company.model";
import { Group } from "./Group.model";


export class User {
  id?: string;
  // tslint:disable-next-line:variable-name
  _id?: string;
  companyId!: Company;
  name?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  password?: string;
  groupsId?: Group;
}

export class ResToken {
  token?: string;
}
