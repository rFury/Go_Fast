import { RefList } from "../Models/Ref-list.model";
export enum FeatureActions {
  create = 'create',
  read = 'read',
  update = 'update',
  delete = 'delete',
}

export const listFeatureActions: RefList<FeatureActions>[] = [
  { key: FeatureActions.create, value: 'Create' },
  { key: FeatureActions.read, value: 'Read' },
  { key: FeatureActions.update, value: 'Update' },
  { key: FeatureActions.delete, value: 'Delete' },
];
