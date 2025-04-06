import { Feature } from "./Feature.model";

export class GroupFeature {
  id?: string;
  // tslint:disable-next-line:variable-name
  _id?: string;
  featureId?: Feature;
  status?: boolean;
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
  list?: boolean;
  defaultFeature?: boolean;
}
