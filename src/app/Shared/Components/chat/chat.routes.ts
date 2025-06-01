import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes } from '@angular/router';
import { ChatService } from './chat.service';
import { catchError, throwError } from 'rxjs';
import { ChatComponent } from './chat.component';
import { ChatsComponent } from './chats/chats.component';
import { ConversationComponent } from './conversation/conversation.component';
const conversationResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
    {
        const chatService = inject(ChatService);
        const router = inject(Router);
        return chatService.getChatById(route.paramMap.get('id')!).pipe(
            catchError((error) =>
            {
                console.error(error);
                const parentUrl = state.url.split('/').slice(0, -1).join('/');
    
                router.navigateByUrl(parentUrl);
    
                return throwError(error);
            }),
        );
    };


export default [
    {
        path     : '',
        component: ChatComponent,
        resolve  : {
            chats   : () => inject(ChatService).getChats(),
            contacts: () => inject(ChatService).getContacts(),
        },
        children : [
            {
                path     : '',
                component: ChatsComponent,
                children : [
                    {
                        path     : ':id',
                        component: ConversationComponent,
                        resolve  : {
                            conversation: conversationResolver,
                        },  
                    },
                ],
            },
        ],
    },
] as Routes;
