import { UserRegistry, Groups, Folders } from './DATABASE.js'; 
import { FolderAdmins, FolderSuspensions } from './DATABASE.js';
import { Chats, InternalSignature } from './DATABASE.js';

///////////////////////// MICRO SERVICE FUNCTIONS //////////////////////////////

/// have a userid header that resolves to user data 
export const resolve_identity = (user_id,quantity) => {

    if (quantity === 'detail'){
        const data_row = UserRegistry[user_id]
        return data_row;
    }
    if (quantity === 'content'){
        const bulk_data = UserRegistry
        return bulk_data;
    }

};

export const resource_data_retrieval = (data_amount,user_id,resource_type,resource_item,action) => {
    
    // const folder_list = Object.values(Folders).filter(row => row.group === chat_group)
    // const chat_list = Object.values(Chats).filter(row => row.folder === chat_folder)

    if (resource_type === "group"){
        
        if (data_amount == 'detail'){
            const data_pull = user_resource_crud_authorization(user_id,'group',resource_item,action)

            if (data_pull.status !== 'denied'){
                return {data_pull}

            }
            return 

        }
        if (data_amount == 'content'){
            const bulk_data_amalgamation = []
            const bulk_data_denied = []

            for (const [key,value] of Object.entries(Groups)){
                const data_pull = user_resource_crud_authorization(user_id,'group',key,action)

                if (data_pull.status === 'allowed'){
                    bulk_data_amalgamation.push(Groups[key])
                }
                if (data_pull.status === 'denied'){
                    bulk_data_denied.push({status: 'denied',group: key})

                }

            }
            
            console.log({allowed: bulk_data_amalgamation,denied: bulk_data_denied})
            return {allowed: bulk_data_amalgamation,denied: bulk_data_denied}
            
        }

        return

    }
    if (resource_type === "folder"){
        
        if (data_amount == 'detail'){
            const data_pull = user_resource_crud_authorization(user_id,'folder',resource_item,action)

            if (data_pull.status !== 'denied'){
                return {data_pull}

            }
            return 

        }
        if (data_amount == 'content'){
            const bulk_data_amalgamation = []
            const bulk_data_denied = []

            for (const [key,value] of Object.entries(Folders)){
                const data_pull = user_resource_crud_authorization(user_id,'folder',key,action)

                if (data_pull.status === 'allowed'){
                    bulk_data_amalgamation.push(Folders[key])

                }
                if (data_pull.status === 'denied'){
                    bulk_data_denied.push({status: 'denied',folder: key})

                }

            }

            console.log({allowed: bulk_data_amalgamation,denied: bulk_data_denied})
            return {allowed: bulk_data_amalgamation,denied: bulk_data_denied}
            
        }

        return

    }
    if (resource_type === "chat"){
        
        if (data_amount == 'detail'){
            const data_pull = user_resource_crud_authorization(user_id,'chat',resource_item,action)

            if (data_pull.status !== 'denied'){
                return {data_pull}

            }
            return 

        }
        if (data_amount == 'content'){
            const bulk_data_amalgamation = []
            const bulk_data_denied = []

            for (const [key,value] of Object.entries(Chats)){
                const data_pull = user_resource_crud_authorization(user_id,'chat',key,action)

                if (data_pull.status === 'allowed'){
                    bulk_data_amalgamation.push(Chats[key])

                }
                if (data_pull.status === 'denied'){
                    bulk_data_denied.push({status: 'denied',folder: key})

                }

            }
            
            console.log({allowed: bulk_data_amalgamation,denied: bulk_data_denied})
            return {allowed: bulk_data_amalgamation,denied: bulk_data_denied}
            
        }

        return

    }


}


export const user_resource_crud_authorization = (user_id,resource_type,resource_item,action) => {

    const visibility = resource_visibility(resource_type,resource_item,user_id);

    if (visibility['status'] === 'allowed' && action === 'read'){
        return {status: 'allowed'}

    }
    if (resource_type === "group"){
        // group -> c [user], r [members], u [owner], d[owner]
        const group_data = resource_manipulation('read', resource_type, resource_item, user_id) 
        const group_owner = group_data.owner

        if (group_owner === user_id && action === 'create'){

            return {status: 'allowed'}
        }
        if (group_owner === user_id && action === 'update'){

            return {status: 'allowed'}
        }
        if (group_owner === user_id && action === 'delete'){

            return {status: 'allowed'}
        }

    }
    if (resource_type === "folder"){
        // folder -> c [owner],r [allowed_members,owner], u [admin,owner], d[owner,admin]
        const folder_admin_data = resource_manipulation('read', 'folderadmin', resource_item, user_id) || 'not_found'
        const folder_data = resource_manipulation('read', resource_type, resource_item, user_id) 
        const group_data = resource_manipulation('read', 'group', folder_data.group, user_id) 
        const group_owner = group_data.owner

        if (group_owner === user_id && action === 'create'){

            return {status: 'allowed'}
        }
        if (folder_admin_data !== 'not_found'){
            const folder_admin = folder_admin_data.admin

            if (group_owner === user_id || folder_admin === user_id && action === 'update'){

                return {status: 'allowed'}
            }

        }
        if (group_owner === user_id && action === 'delete'){

            return {status: 'allowed'}
        }

    }
    if (resource_type === "chat"){
        // chat -> c[non-suspended-folder-member],r [anyone,unless private ... admin], u [author], d[author,admin]
        const chat_data = resource_manipulation('read', resource_type, resource_item, user_id) 
        const folder_admin_data = resource_manipulation('read', 'folderadmin', chat_data.folder, user_id) || 'not_found'
        const chat_author = chat_data.author

        if (chat_author === user_id && action === 'create'){

            return {status: 'allowed'}
        }
        if (chat_author === user_id && action === 'update'){

            return {status: 'allowed'}
        }
        if (chat_author === user_id && action === 'delete'){

            return {status: 'allowed'}
        }
        if (folder_admin_data !== 'not_found'){
            const folder_admin = folder_admin_data.admin

            if (folder_admin === user_id && action === 'delete'){

                return {status: 'allowed'}
            }

        }

    }

    return {status: 'denied'}

}


export const resource_authorization = (resource_type,resource_item,user_id, action) => {

    if (resource_type === 'group'){
        const item_existance = resource_existance('group',resource_item);

        if (item_existance['status'] === 'present'){
            const allowed_crud_action = user_resource_crud_authorization(user_id,resource_type,resource_item,action);

            return allowed_crud_action
        }

    };
    if (resource_type === 'folder'){
        const item_existance = resource_existance('folder',resource_item);

        if (item_existance['status'] === 'present'){
            const allowed_crud_action = user_resource_crud_authorization(user_id,resource_type,resource_item,action);

            return allowed_crud_action
        }

    };
    if (resource_type === 'chat'){
        const item_existance = resource_existance('chat',resource_item);

        if (item_existance['status'] === 'present'){
            const allowed_crud_action = user_resource_crud_authorization(user_id,resource_type,resource_item,action);
        
            return allowed_crud_action
        }

    };


    return {status : "guest"}
};


export const cache_system = (ttl, user_location_db) => {
    return {data : ""}
};

// inter-service calls need to check the internal signature first
export const internal_trust_system = (from_service,to_service) => {
    return {data : ""}
};


export const hierarchy_check = (member_primary,member_secondary,group,folder) => {
    return {data : ""}
};


/////////////////////////// INTERNAL LOGIC FUNCTIONS ///////////////////////////////

export const resource_existance = (resource_type, resource_item) => {
    if (resource_type === 'group'){
        const item_check = Groups[resource_item] || "not_found"
        if (item_check === 'not_found'){return {status: "absent"}}
        
        return {status: "present"}
    }

    if (resource_type === 'folder'){
        const item_check = Folders[resource_item] || "not_found"
        if (item_check === 'not_found'){return {status: "absent"}}
        
        return {status: "present"}
    }

    if (resource_type === 'chat'){
        const item_check = Chats[resource_item] || "not_found"
        if (item_check === 'not_found'){return {status: "absent"}}

        return {status: "present"}
    }

};


// check group/userRegistry  user existance/active [guest/user]
// check user suspended or not
// check user role group/folder/chat [owner, admin, creator, user]

// allow members to view private groups,folders,folder chats
// userregistry [status] & FolderSuspension

// check group visibility - folder visibility - chat visibility
// only people in the folder can see if private ... same for folder and group
export const resource_visibility = (resource_type,resource_item,user_id) => {

    if (resource_type === 'group'){

        const group_data = resource_manipulation('read','group',resource_item,user_id)
        const group_owner_access = check_ownership(user_id,'group',resource_item);
        const group_members = group_data.members

        if (group_owner_access === 'allowed'){
            return {status:'allowed',authorized_list: ['group']}
        }
        if (group_data.is_public === true){
            return {status:'allowed',authorized_list: ['group']}
        };
        if (group_data.is_public === false && group_members.includes(user_id)){
            return {status:'allowed',authorized_list: ['group']}
        };


    }
    if (resource_type === 'folder'){
// check if user is in folder if not and is public check group members otherwise denied
        const folder_data = resource_manipulation('read','folder',resource_item,user_id)
        const folder_admin_access = check_ownership(user_id,'folderadmin',resource_item) || 'not_found';

        const folder_group = folder_data.group
        const is_user_allowed_group_data = resource_visibility('group',folder_group,user_id);

        const folder_members = folder_data.allowed_members
        const is_user_folder_member = folder_members.includes(user_id) || 'not_found'

        const folder_suspension_data = resource_manipulation('read','foldersuspension',resource_item,user_id) || 'not_found'

        
        if ( is_user_folder_member === true && folder_suspension_data !== 'not_found'){
            const folder_suspension_list = folder_suspension_data.suspended
            const is_user_folder_suspended = folder_suspension_list.includes(user_id) || 'not_found'

            if (is_user_folder_suspended === false || is_user_folder_suspended === 'not_found'){
                return {status:'allowed',authorized_list: ['folder']}

            }

        }
        if ( is_user_folder_member === true && folder_suspension_data === 'not_found'){
            return {status:'allowed',authorized_list: ['folder']}

        }
        if ( folder_admin_access === 'allowed'){
            return {status:'allowed',authorized_list: ['folder']}

        }
        if (is_user_allowed_group_data.status === 'allowed' && folder_data.is_public === true){
            return {status:'allowed',authorized_list: ['folder']}

        }


    };
    if (resource_type === 'chat'){

        const chat_data = resource_manipulation('read','chat',resource_item,user_id)
        const chat_folder = chat_data['folder']

        const chat_folder_data = resource_manipulation('read','folder',chat_folder,user_id)
        const chat_group = chat_folder_data['group']

        const chat_group_data = resource_manipulation('read','group',chat_group,user_id)
        const group_owner_access = check_ownership(user_id,'group',chat_group);

        const folder_admin_access = check_ownership(user_id,'folder',chat_folder);
        const chat_author_access = check_ownership(user_id,'chat',resource_item);

        if (group_owner_access === 'allowed' || folder_admin_access === 'allowed' || chat_author_access === 'allowed'){

            if (group_owner_access === 'allowed'){
                return {status:'allowed',authorized_list: ['group','folder','chat']}
            }
            if (folder_admin_access === 'allowed'){
                return {status:'allowed',authorized_list: ['folder','chat']}
            }
            if (chat_author_access === 'allowed'){
                return {status:'allowed',authorized_list: ['chat']}
            }

        }
        if (chat_group.is_public === true){

            if (chat_folder.is_public === true){
                if (chat_data.is_public === true){
                    return {status:'allowed',authorized_list: ['chat']}

        }}};

    }

    return {status : "denied"}
}


export const check_ownership = (user_id,resource_type,resource_item) => {
    
    if (resource_type === 'group'){
        const item_data = Groups[resource_item]
        if (user_id === item_data.owner){ return 'allowed' }

    };
    if (resource_type === 'folderadmin'){

        const item_data = FolderAdmins[resource_item] || 'not found'
        if (item_data !== 'not_found'){
            if (user_id === item_data.admin){ return 'allowed' }
        }

    };
    if (resource_type === 'chat'){
        const item_data = Chats[resource_item]
        if (user_id === item_data.author){ return 'allowed' }

    };

    return 'denied'
};


// UserRegistry,Groups,Folders,FolderAdmins,Chats,FolderSuspensions,InternalSignature
// type_of_action,read,update,delete,post
// request_from [system/user] , user_id [user_id,internal_signature]
export const resource_manipulation = (type_of_action, resource_type, resource_item, user_id) => {

// later have confirmation of internal sign passed as user_id from visibility check
    if (type_of_action === 'read'){

        if ( resource_type === 'group'){
            const item_fetched = Groups[resource_item] || 'not_found'
            return item_fetched
        }
        if ( resource_type === 'folder'){
            const item_fetched = Folders[resource_item] || 'not_found'
            return item_fetched
        }
        if ( resource_type === 'chat'){
            const item_fetched = Chats[resource_item] || 'not_found'
            return item_fetched
        }
        if ( resource_type === 'folderadmin'){
            const item_fetched = FolderAdmins[resource_item] || 'not_found'
            return item_fetched
        }
        if ( resource_type === 'userregistry'){
            const item_fetched = UserRegistry[resource_item] || 'not_found'
            return item_fetched
        }
        if ( resource_type === 'foldersuspension'){
            const item_fetched = FolderSuspensions[resource_item] || 'not_found'
            return item_fetched
        }

    }
    if (type_of_action === 'create'){

        if ( resource_type === 'group'){
            return 
        }
        if ( resource_type === 'folder'){
            return 
        }
        if ( resource_type === 'chat'){
            return 
        }

    }
    if (type_of_action === 'update'){

        if ( resource_type === 'group'){
            return 
        }
        if ( resource_type === 'folder'){
            return 
        }
        if ( resource_type === 'chat'){
            return 
        }

    }
    if (type_of_action === 'delete'){

        if ( resource_type === 'group'){
            return 
        }
        if ( resource_type === 'folder'){
            return 
        }
        if ( resource_type === 'chat'){
            return 
        }

    }


    return

};





/////////////////////////////////////////////////////////////////////////////////