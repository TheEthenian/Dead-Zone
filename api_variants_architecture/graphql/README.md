            [WHITEBOARD]


> instrospection tactics
> design flaws
> logic errors similar to REST

> write proper graphql curls
> write auth flow for those nested sophisticated fields
> work with mutation
> familiarity with sophisticated grahql servers




curl -X POST http://localhost:8000/graphql \                                        
     -H "Content-Type: application/json" \     
     -d '{
       "query": "{userDetails(id:1){subscription}}"
     }'


