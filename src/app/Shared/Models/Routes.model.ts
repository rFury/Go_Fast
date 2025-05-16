import { Agent } from "./Agent.model";
import { Order } from "./Order.model";

export class Routes{
    _id?:string;
    agentId?:Agent;
    orders?:Order[];
    totalVolume?:string;
    totalTime?:string;
}