export class Place{
    id?: string;
    name?: string;
    gouvernorat?: string;
    coordinates?:[number,number];

    setPlace(details:string){
        const detailsArray = details.split(',');
        this.name = detailsArray[0];
        this.gouvernorat = detailsArray[1];
    }
}