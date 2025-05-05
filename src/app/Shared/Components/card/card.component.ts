import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, HostBinding, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Animations } from '../../Animations/public-api';
import { FuseCardFace } from '../../Models/card.types';

@Component({
    selector     : 'card',
    templateUrl  : './card.component.html',
    styleUrls    : ['./card.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : Animations,
    exportAs     : 'Card',
    standalone   : true,
})
export class CardComponent implements OnChanges
{
    static ngAcceptInputType_expanded: BooleanInput;
    static ngAcceptInputType_flippable: BooleanInput;

    @Input() expanded: boolean = false;
    @Input() face: FuseCardFace = 'front';
    @Input() flippable: boolean = false;

    constructor()
    {
    }

    @HostBinding('class') get classList(): any
    {
        return {
            'fuse-card-expanded'  : this.expanded,
            'fuse-card-face-back' : this.flippable && this.face === 'back',
            'fuse-card-face-front': this.flippable && this.face === 'front',
            'fuse-card-flippable' : this.flippable,
        };
    }

    ngOnChanges(changes: SimpleChanges): void
    {
        // Expanded
        if ( 'expanded' in changes )
        {
            // Coerce the value to a boolean
            this.expanded = coerceBooleanProperty(changes['expanded'].currentValue);
        }

        // Flippable
        if ( 'flippable' in changes )
        {
            // Coerce the value to a boolean
            this.flippable = coerceBooleanProperty(changes['flippable'].currentValue);
        }
    }
}
