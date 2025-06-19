import { Governorate } from "./Gouvernorat.model";
import { Order } from "./Order.model";
import { Place } from "./Place.model";
import { User } from "./User.model";

export class Agent extends User{
    phone1?:string;
    phone2?:string;
    agentStatus?:string;
    coordinates?:[number,number];

    constructor(){
        super();
        this.type="agent";
    }

}