///////////////////////////////////////////////////////////////////////////////////

// 1. GLOBAL_REGISTRY (Identity & Status)
export const UserRegistry = {
    "u_1": { name: "Alice", status: "ACTIVE", location: "NewYork"},
    "u_2": { name: "Bob", status: "ACTIVE", location: "NewYork"},   
    "u_3": { name: "Charlie", status: "DEACTIVATED", location: "HongKong"}, 
    "u_4": { name: "Dave", status: "ACTIVE", location: "NewYork"},
    "u_5": { name: "Eve", status: "DEACTIVATED", location: "HongKong"},
    "u_6": { name: "Frank", status: "ACTIVE", location: "HongKong"}, 
    "u_7": { name: "Grace", status: "ACTIVE", location: "NewYork"}, 
    "u_8": { name: "Jack", status: "DEACTIVATED", location: "HongKong"}, 
    "u_9": { name: "Marlow", status: "ACTIVE", location: "NewYork"}, 
    "u_10": { name: "Heidi", status: "", location: "HongKong"}   
};

// 2. (Group RBAC)
export const Groups = {
    "g_1": { owner: "u_2", members: ["u_1","u_2","u_3","u_4"], is_public: true},
    "g_2": { owner: "u_7", members: ["u_5","u_6","u_7","u_8"], is_public: false},
    "g_3": { owner: "u_9", members: ["u_6","u_7","u_8","u_9"], is_public: false},
    "g_4": { owner: "u_8", members: ["u_7","u_8","u_9","u_10"], is_public: true},
    "g_5": { owner: "u_10", members: ["u_5","u_6","u_9","u_10"], is_public: true}
};

// 3. SCOPED_FOLDERS (ABAC + Public Visibility) / The 'is_public' flag is the "Thief's Entry"
export const Folders = {
    "f_1": { name: "Roadmap", group: "g_1", allowed_members: ["u_1","u_3","u_4"], is_public: true },
    "f_2": { name: "Budgets", group: "g_4", allowed_members: ["u_7","u_10"], is_public: false },
    "f_3": { name: "Specs", group: "g_2", allowed_members: ["u_5","u_6","u_7","u_8"], is_public: false },
    "f_4": { name: "Cenzo", group: "g_5", allowed_members: ["u_5","u_6","u_9"], is_public: true },
    "f_5": { name: "Archive", group: "g_3", allowed_members: ["u_6","u_8"], is_public: false },
    "f_6": { name: "map", group: "g_5", allowed_members: ["u_9","u_10","u_6"], is_public: true },
    "f_7": { name: "Bud", group: "g_4", allowed_members: ["u_8","u_7","u_10"], is_public: false },
};


export const FolderAdmins = {
    "f_1": { admin: "u_4"}, 
    "f_7": { admin: "u_7"}, 
    "f_4": { admin: "u_9"},
    "f_5": { admin: "u_8"}
};


export const FolderSuspensions = {
    "f_1": { suspended: ["u_5"]}, 
    "f_3": { suspended: ["u_4"]}, 
    "f_5": { suspended: ["u_1"]}
};

// 4. CHAT_VAULT (The Content)
export const Chats = {
    "ch_01": { folder: "f_3", author: "u_8", text: "Q2 Roadmap is live", is_public: true },
    "ch_02": { folder: "f_4", author: "u_5", text: "Alice's Salary: $150k", is_public: false },
    "ch_03": { folder: "f_1", author: "u_1", text: "Planning to fire Bob", is_public: true }
};

export const InternalSignature = {
    "sig_01": {origin_service: "something", destination_service: "here"},
    "sig_02": {origin_service: "something2", destination_service: "here2"},
    "sig_03": {origin_service: "something3", destination_service: "here3"}
}

///////////////////////////////////////////////////////////////////////////////////