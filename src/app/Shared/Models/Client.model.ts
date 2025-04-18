import { Order } from "./Order.model";
import { Place } from "./Place.model";
import { User } from "./User.model";

export class Client extends User{
    phone?:string;
    city?:Place;
    accountType?:string;
    Orders?:Order[];

    constructor(){
        super();
        this.type="client";
    }

}