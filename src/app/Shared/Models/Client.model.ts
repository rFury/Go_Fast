import { Governorate } from "./Gouvernorat.model";
import { Order } from "./Order.model";
import { Place } from "./Place.model";
import { User } from "./User.model";

export class Client extends User{
    phone?:string;
    city?:Governorate;
    accountType?:string;
    Orders?:Order[];
    twostep?:boolean;

    constructor(){
        super();
        this.type="client";
    }

}