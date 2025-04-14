import { RefList } from "../Models/Ref-list.model";

export enum DeliveryType {
    building = 'building',
    apartment = 'apartment',
  }
  export const listOrderType: RefList<DeliveryType>[] = [
    { key: DeliveryType.building, value: 'building' },
    { key: DeliveryType.apartment, value: 'apartment' },
  ];