import { DeliveryType } from "../enums/delivery.enums";
import { Point } from "./Point.model";
import { Product } from "./Product.model";

export class Order{
    _id?:string;
    code?:string;
    pick_up?:Point;
    destination?:Point;
    type?:DeliveryType;
    proudct?:Product | string;
}