export class Place{
    id?: string;
    name?: string;
    gouvernorat?: string;
    coordinates?: {
      lat?: number;
      lng?: number;
    };

    setPlace(details:string){
        const detailsArray = details.split(',');
        this.name = detailsArray[0];
        this.gouvernorat = detailsArray.slice(1).join(', ');
    }
}