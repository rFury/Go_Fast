export class Place{
    id?: string;
    name?: string;
    gouvernorat?: string;
    coordinates?:[number,number];

    setPlace(details:string,type:string){
        const detailsArray = details.split(',');
        if(type!=='postcode'){
            if(detailsArray.length===3){
                this.name = detailsArray[0];
                this.gouvernorat = detailsArray[1];
            }
            else{
                this.name = detailsArray[0];
                this.gouvernorat = detailsArray[0];
            }
        }else{
            this.name = detailsArray[1];
            this.gouvernorat = detailsArray[2];
        }
    }
}