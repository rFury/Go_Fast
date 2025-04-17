import { Order } from "./Order.model";
import { User } from "./User.model";

export class Client extends User{
    phone?:string;
    city?:string;
    accountType?:string;
    Orders?:Order[];

    constructor(){
        super();
        this.type="client";
    }

}