import grpc
from concurrent import futures
import uvicorn
from fastapi import FastAPI, Header, HTTPException
import schema_pb2
import schema_pb2_grpc

# --- 1. SHARED VULNERABLE CORE ---
class MockDatabase:
    def __init__(self):
        self.data = {
            "ACC_001": {"owner": "alice", "balance": 4500.0, "note": "Hidden in Zurich"},
            "ACC_002": {"owner": "bob", "balance": 120.0, "note": "Rent money"}
        }

    def get_record(self, acc_id):
        # BOLA VULNERABILITY: Returns the object without checking the requester's identity.
        return self.data.get(acc_id)

db = MockDatabase()

# --- 2. gRPC INTERNAL SERVICE ---
class VaultServicer(schema_pb2_grpc.VaultServiceServicer):
    def GetAccount(self, request, context):
        record = db.get_record(request.account_id)
        if not record:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            return schema_pb2.AccountResponse()
        
        return schema_pb2.AccountResponse(
            account_id=request.account_id,
            owner_id=record["owner"],
            balance=record["balance"],
            secret_note=record["note"]
        )

# --- 3. REST GATEWAY (FastAPI) ---
app = FastAPI(title="Rugged BOLA Lab")

@app.get("/api/v1/vault/{acc_id}")
async def rest_gateway(acc_id: str, x_user_id: str = Header(None)):
    """
    Simulates a REST Gateway that 'transmutes' traffic to internal gRPC.
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Missing User Header")

    # Connect to the local gRPC server
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = schema_pb2_grpc.VaultServiceStub(channel)
        try:
            # Transmute REST params into a gRPC Protobuf message
            grpc_msg = schema_pb2.AccountRequest(account_id=acc_id, requester_id=x_user_id)
            response = stub.GetAccount(grpc_msg)
            
            return {
                "account_id": response.account_id,
                "balance": response.balance,
                "note": response.secret_note,
                "protocol_path": "REST -> gRPC Transmux"
            }
        except grpc.RpcError as e:
            raise HTTPException(status_code=404, detail="Account not found")

# --- 4. EXECUTION ---
if __name__ == "__main__":
    import threading
    
    # Start gRPC in a background thread
    def serve_grpc():
        server = grpc.server(futures.ThreadPoolExecutor(max_workers=5))
        schema_pb2_grpc.add_VaultServiceServicer_to_server(VaultServicer(), server)
        server.add_insecure_port('[::]:50051')
        print("[*] gRPC Server running on port 50051")
        server.start()
        server.wait_for_termination()

    threading.Thread(target=serve_grpc, daemon=True).start()
    
    # Start REST Gateway
    print("[*] REST Gateway running on port 8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
