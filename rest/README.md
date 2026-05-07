//////////  [README] //////////////////

> Access Control
> Data leakage
> Logic Manipulation
> DDos

////////// Endpoints ///////////////

> /group/

> /folder/

> /chat/

Options
= /content
= /detail
= crud option for all endpoints 

> /cache/*
= preceding is the urls above [ttl {1s,5s,10s}]
= not yet implemented for testing cache attacks


////////////// Role Features ///////////////

> Group Owner
- make folder private/public
- visiblity of everything in group
- upoint admin
- crud folders

> Folder Admin 
- make folder private/public
- visibility of all chats in folder
- un/suspend folder members
- delete member chats

> Member
- visibility of private group
- visibility of private invited folder
- make chat private 
- crud chat

> Public Groups/Folder
- read by anyone only for the public content within

> Private Groups/Folder
- read only by the curated members

> Private Chats
- read by folder members
- read by group owner


////////// Functions ///////////////
/////// Internal micro-service simulation ///////
> inter api pass the torch security (trust chains):

- resolve identity
- resource data retrieval
- user resource crud authorization
- resource authorization
- cache system
- internal trust system 
- hierarchy check
- resource existance
- resource visibility
- check ownership
- resource manipulation

NB: only testing auth and possibilities,resource manipulation includes user-to-admin upgrade suspension-folder-member deactivate-user ..... the aim is to check possibility ...so crud returns {status: 'allowed'} or the antithesis.

//////////  database ////////// 

> Users
> Groups RBAC
> Folders RBAC & IDOR & ABAC
> Chats IDOR & ABAC
> Folder admins
> Folder suspension
> Internal signature

//////////// CURLS ////////////////

NB: Mostly using Get request with special headers to allow for quasi post requests for simplicity but covers everything .... remember this is the rugged-jungle[RJ]

curl
-H 'userid: u_5'
-H 'item_id: ch_01'
-H 'action: read'
http://localhost:5000/chat/detail 
= one/all chats in the folder of user


curl
-H 'userid: u_5'
-H 'item_id: f_2'
-H 'action: read'
http://localhost:5000/folder/detail or contents
= all chats in the folder


curl
-H 'userid: u_5'
-H 'item_id: g_3'
-H 'action: read'
http://localhost:5000/group/detail or contents
= group details
= all folders in the group


curl
-H 'userid: u_5'
-H 'item_id: g_3'
-H 'action: read'
http://localhost:5000/home
= all groups








