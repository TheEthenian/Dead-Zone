import strawberry
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter


Users = {
    1: {"name": "june", "subscription": 'active'},
    2: {"name": "wednsday", "subscription": "deactivated"},
    3: {"name": "mrZero", "subscription": "active"}
}

Folders = {
    101: {"ownerid": 2, "title": "Redjungle", "notes": "welcome to api oasis"},
    102: {"ownerid": 2, "title": "OPS", "notes": "maybe he is not a believer"},
    103: {"ownerid": 1, "title": "Order66", "notes": "you were to be the best of us"}
}


#######################################################################
# --- GraphQL Types ---
@strawberry.type
class USER:
    name: str
    subscription: str

@strawberry.type
class FOLDER:
    ownerid: int 
    title: str
    notes: str
    

#######################################################################
def format_data_structure_from_db(db,id):
    if db == 'Users':
        data = Users[id]
        reconstituted  = USER(name=data['name'],subscription=data['subscription'])
        return reconstituted


    if db == 'Folders':
        data = Folders[id]
        reconstituted  = FOLDER(ownerid=data['ownerid'],title=data['title'],notes=data['notes'])
        return reconstituted


#######################################################################
# --- Queries & Resolvers ---
@strawberry.type
class QUERY:

    @strawberry.field
    def userDetails(self, id:int) -> USER:
        user_data = format_data_structure_from_db('Users',id)
        return user_data
        
    @strawberry.field
    def folderDetails(self, id:int) -> FOLDER:
        folder_data = format_data_structure_from_db('Folders',id)
        return folder_data
        


#######################################################################
# --- FastAPI Integration ---
schema = strawberry.Schema(query=QUERY)

# Simulating a user session via headers for the lab
def get_context(user_id):

    return {"user": USERS[user_id]}

graphql_app = GraphQLRouter(schema)

app = FastAPI()
app.include_router(graphql_app, prefix="/graphql")


#######################################################################