import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Chat } from '../../Models/chat.types';
import { environment } from '../../../../environments/environment';
import { User } from '../../Models/User.model';
@Injectable({providedIn: 'root'})
export class ChatService
{
    private _chat: BehaviorSubject<Chat | null> = new BehaviorSubject<Chat | null>(null);
    private _chats: BehaviorSubject<Chat[] | null> = new BehaviorSubject<Chat[] | null>(null);
    private _contact: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
    private _contacts: BehaviorSubject<User[] | null> = new BehaviorSubject<User[] | null>(null);
    //private _profile: BehaviorSubject<Profile | null> = new BehaviorSubject<Profile | null>(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for chat
     */
    get chat$(): Observable<Chat | null>
    {
        return this._chat.asObservable();
    }

    /**
     * Getter for chats
     */
    get chats$(): Observable<Chat[] | null>
    {
        return this._chats.asObservable();
    }

    /**
     * Getter for contact
     */
    get contact$(): Observable<User | null>
    {
        return this._contact.asObservable();
    }

    /**
     * Getter for contacts
     */
    get contacts$(): Observable<User[] | null>
    {
        return this._contacts.asObservable();
    }

    /**
     * Getter for profile
     */
    //get profile$(): Observable<Profile | null>
    //{
    //    return this._profile.asObservable();
    //}

    getChats(): Observable<any>
    {
        return this._httpClient.get<Chat[]>(environment.api+'/chats').pipe(
            tap((response: Chat[]) =>
            {
                this._chats.next(response);
            }),
        );
    }

    getContact(id: string): Observable<any>
    {
        return this._httpClient.get<User>(environment.api+'/chats/contact', {params: {id}}).pipe(
            tap((response: User) =>
            {
                this._contact.next(response);
            }),
        );
    }

    /**
     * Get contacts
     */
    getContacts(): Observable<any>
    {
        return this._httpClient.get<User[]>(environment.api+'/chats/contacts').pipe(
            tap((response: User[]) =>
            {
                this._contacts.next(response);
            }),
        );
    }

    getChatById(id: string): Observable<any>
    {
        return this._httpClient.get<Chat>(`${environment.api}/chats/${id}`).pipe(
            map((chat) =>
            {
                // Update the chat
                this._chat.next(chat);

                // Return the chat
                return chat;
            }),
            switchMap((chat) =>
            {
                if ( !chat )
                {
                    return throwError('Could not found chat with id of ' + id + '!');
                }

                return of(chat);
            }),
        );
    }


    createChat(contact: User): Observable<Chat | null>
    {
        return this._httpClient.post<Chat>(environment.api+'/chats', {contactId: contact._id}).pipe(
            tap((response: Chat) =>
            {
                console.log(response);
                this._chats.next([...this._chats.value!, response]);
            }),
        );
    }

    updateChat(id: string, chat: Chat): Observable<Chat | null>
    {
    return this.chats$.pipe(
            take(1),
            switchMap(chats => this._httpClient.patch<Chat>(environment.api+'/chat', {
                id,
                chat,
            }).pipe(
                map((updatedChat) =>
                {
                    // Find the index of the updated chat
                    const index = chats!.findIndex(item => item._id === id);

                    // Update the chat
                    chats![index] = updatedChat;

                    // Update the chats
                    this._chats.next(chats);

                    // Return the updated contact
                    return updatedChat;
                }),
                switchMap(updatedChat => this.chat$.pipe(
                    take(1),
                    filter(item => item!==null && item._id === id),
                    tap(() =>
                    {
                        // Update the chat if it's selected
                        this._chat.next(updatedChat);

                        // Return the updated chat
                        return updatedChat;
                    }),
                )),
            )),
        );
    }

    /**
     * Reset the selected chat
     */
    resetChat(): void
    {
        this._chat.next(null);
    }
}
