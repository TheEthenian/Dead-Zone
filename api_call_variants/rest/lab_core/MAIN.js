/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

import express from 'express';
const app = express();
const PORT = 5000;

import { resolve_identity, resource_data_retrieval } from './FUNCTION.js';

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
// resource = /group/ ->folders ,/folder/ -> chats, / -> groups ... 
// action = [crud]
// header/body = user_id,amount[singular/plural],item_id {if singular}
app.get('/:resource/:area', (req, res) => {
    const resource = req.params.resource;
    const specification = req.params.area;

    const user_detail = req.headers['userid'];
    const item_detail = req.headers['itemid'];
    const action = req.headers['action'];

    if (resource === 'user' ){
        const get_user = resolve_identity(user_detail,specification)

        return res.status(200).json({'data': get_user})

    }
    if (resource === 'group' ){

        if (specification === 'detail'){
            const data_pool = resource_data_retrieval('detail',user_detail,'group',item_detail,action)

            return res.status(200).json(data_pool)
        }
        if (specification === 'content'){
            const data_pool = resource_data_retrieval('content',user_detail,'group',item_detail,action)

            return res.status(200).json(data_pool)
        }

    }
    if (resource === 'folder' ){

        if (specification === 'detail'){
            const data_pool = resource_data_retrieval('detail',user_detail,'folder',item_detail,action)

            return res.status(200).json(data_pool)
        }
        if (specification === 'content'){
            const data_pool = resource_data_retrieval('content',user_detail,'folder',item_detail,action)

            return res.status(200).json(data_pool)
        }

    }
    if (resource === 'chat' ){

        if (specification === 'detail'){
            const data_pool = resource_data_retrieval('detail',user_detail,'chat',item_detail,action)

            return res.status(200).json(data_pool)
        }
        if (specification === 'content'){
            const data_pool = resource_data_retrieval('content',user_detail,'chat',item_detail,action)

            return res.status(200).json(data_pool)
        }

    }


});


app.post('/:resource/:action', (req, res) => {
    const resource = req.params.resource;
    const action = req.params.action;
    const user_detail = req.headers['userid'];


    return res.status(200).json({'hello': api_0})
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

app.listen(PORT, () => {
    console.log(`[*] Rugged JS Gateway running on http://localhost:${PORT}`);
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////