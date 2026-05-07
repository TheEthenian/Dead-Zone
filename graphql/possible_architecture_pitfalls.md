To understand the landscape of GraphQL at scale, we must look beyond basic CRUD. The following four architectures represent how top-tier engineering organizations (Netflix, Meta, Shopify, and GitHub) leverage GraphQL to solve specific distributed system challenges.

---

### 1. The Federated Gateway (Netflix/Apollo Model)
**Focus:** Orchestration of disparate microservices into a single graph.
In this architecture, the GraphQL layer acts as a "Supergraph." It doesn't own the data; it fetches it from "subgraphs" (REST, gRPC, or other GraphQL services). 

```python
import strawberry
from typing import List, Optional
import httpx # Simulating inter-service communication

@strawberry.type
class UserProfile:
    id: int
    username: str

@strawberry.type
class Subscription:
    status: str
    tier: str

@strawberry.type
class Query:
    @strawberry.field
    async def get_user_context(self, user_id: int) -> UserProfile:
        # Service A: Auth/Identity
        return UserProfile(id=user_id, username=f"user_{user_id}")

    @strawberry.field
    async def user_subscription(self, user_id: int) -> Subscription:
        # Service B: Billing (Internal REST call)
        # Vulnerability: If this service trust the gateway's user_id without re-verification
        return Subscription(status="ACTIVE", tier="PREMIUM")

schema = strawberry.Schema(query=Query)
```
**Querying the Federated Graph:**
```graphql
query {
  getUserContext(userId: 1) { username }
  userSubscription(userId: 1) { tier }
}
```
**The Uniqueness:** This architecture introduces **Cross-Service BOLA**. An attacker might be authorized in Service A but manipulate the `userId` passed to Service B’s internal resolver, leveraging the trust established at the gateway level.

---

### 2. The Relay Specification (Meta/Facebook Model)
**Focus:** Scalability and predictable client-side state management.
Meta utilizes the **Relay Spec**, which mandates a Global Object Identifier (`node` interface) and cursor-based pagination to avoid the pitfalls of offset-based limits.

```python
import strawberry
from base64 import b64encode

@strawberry.interface
class Node:
    id: strawberry.ID

@strawberry.type
class LogEntry(Node):
    id: strawberry.ID
    message: str

@strawberry.type
class Query:
    @strawberry.field
    def node(self, id: strawberry.ID) -> Optional[Node]:
        # Global ID decoding (e.g., "LogEntry:101" -> b64 -> ID)
        # Architecture: Every object in the graph is reachable via a single ID
        return LogEntry(id=id, message="XDR Bypass Alert")

schema = strawberry.Schema(query=Query)
```
**Querying the Relay Graph:**
```graphql
query {
  node(id: "TG9nRW50cnk6MTAx") {
    ... on LogEntry {
      message
    }
  }
}
```
**The Uniqueness:** The `node` query is the ultimate target for IDOR. If the server decodes the Base64 ID but fails to verify the user's permission to view that specific *type* of object, you can traverse the entire database by simply incrementing the encoded integers.

---

### 3. The Public Extensibility API (Shopify Model)
**Focus:** Stability and massive throughput for third-party developers.
Shopify uses **Bulk Operations** and strict **Complexity Costing** to protect their infrastructure. Instead of high-frequency polling, they encourage clients to submit a query that the server executes asynchronously and uploads to S3.

```python
@strawberry.type
class BulkOperation:
    id: int
    status: str
    url: Optional[str]

@strawberry.type
class Mutation:
    @strawberry.mutation
    def bulk_query_inventory(self, query: str) -> BulkOperation:
        # Architecture: Asynchronous execution to prevent DoS
        # The query is validated, then queued.
        return BulkOperation(id=55, status="CREATED", url=None)

schema = strawberry.Schema(query=Query, mutation=Mutation)
```
**Querying the Extensibility API:**
```graphql
mutation {
  bulkQueryInventory(query: "{ products { variants { price } } }") {
    id
    status
  }
}
```
**The Uniqueness:** This shifts the attack surface from real-time DoS to **Injection in the Asynchronous Worker**. If the worker executing the `query` string doesn't apply the same sanitization as the frontend API, it creates a "Blind GraphQL Injection" scenario.

---

### 4. Data-Loading Efficiency (GitHub/PayPal Model)
**Focus:** Solving the $N+1$ problem via batching and caching.
High-throughput graphs use **DataLoaders**. When querying a list of 100 projects, instead of 100 database hits for the owners, the DataLoader collects all IDs and performs a single `SELECT * FROM users WHERE id IN (...)`.

```python
from strawberry.dataloader import DataLoader

async def load_users(keys: List[int]) -> List[UserProfile]:
    # Batch retrieval logic: SELECT * FROM users WHERE id = ANY(keys)
    return [USERS.get(key) for key in keys]

loader = DataLoader(load_fn=load_users)

@strawberry.type
class Project:
    owner_id: int
    @strawberry.field
    async def owner(self) -> UserProfile:
        return await loader.load(self.owner_id)
```
**Querying the Aggregation Layer:**
```graphql
query {
  listMyProjects {
    title
    owner {
      username # Batched via DataLoader
    }
  }
}
```
**The Uniqueness:** The complexity here is $O(1)$ database trips for $O(N)$ resources. However, from a bounty perspective, the flaw lies in **Cache Poisoning**. If the DataLoader's internal cache isn't scoped to the specific user's session, User A might receive User B's "Owner" details if they both happen to request the same Resource ID in the same execution window.

---

### Architectural Complexity Summary

| Component | Architecture | Complexity Constraint | Primary Flaw Vector |
| :--- | :--- | :--- | :--- |
| **Gateway** | Federated | $O(M)$ Services | Trust Propagation Failure |
| **Node ID** | Relay | $O(1)$ Lookup | Global ID Enumeration |
| **Bulk Op** | Extensibility | $O(1)$ Connection | Async Logic/Worker Injection |
| **DataLoader**| Aggregation | $O(1)$ DB Trip | Multi-tenant Cache Collision |

Which of these "Big Tech" patterns do you encounter most in your current bug bounty targets—the single massive Relay graph or the fragmented Federated services?
