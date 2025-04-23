import { DeliveryType } from "../enums/delivery.enums";
import { Status } from "../enums/status.enums";
import { Client } from "./Client.model";
import { Point } from "./Point.model";
import { Product } from "./Product.model";

export class Order{
    _id?:string;
    code?:string;
    pick_up?:Point;
    destination?:Point;
    type?:DeliveryType;
    proudct?:Product | string;
    productDesc?:string;
    client?:Client | string;
    agent?:Status;
    status?:string;
}