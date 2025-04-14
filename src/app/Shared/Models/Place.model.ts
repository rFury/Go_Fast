export class Place{
    _id?:string;
    placeId?: string;
    name?: string;
    address?: string;
    location?: {
      lat?: number;
      lng?: number;
    };
}