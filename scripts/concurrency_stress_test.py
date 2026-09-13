import asyncio
import time
import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE_URL = "http://127.0.0.1:8000/api/v1/classify-intent"
PAYLOADS = [
    {"query": "Tôi muốn kiểm tra tình trạng đơn hàng DH-1002"},
    {"query": "Tìm giúp tôi chiếc áo sơ mi nam màu trắng size L"},
    {"query": "Chính sách đổi trả hàng của shop như thế nào?"},
    {"query": "Hủy đơn hàng DH-9921 giúp tôi được không?"},
    {"query": "Sản phẩm này giá bao nhiêu tiền vậy?"},
    {"query": "Tôi muốn hỏi về thời gian giao hàng đi Đà Nẵng"},
    {"query": "Tìm áo thun đen form rộng"},
    {"query": "Đơn hàng của tôi khi nào thì tới nơi?"},
    {"query": "Có mã giảm giá nào cho khách hàng mới không?"},
    {"query": "Hướng dẫn tôi cách thanh toán qua VNPay"}
]

def send_request(idx: int, payload: dict) -> dict:
    start = time.perf_counter()
    req = urllib.request.Request(
        BASE_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            elapsed = time.perf_counter() - start
            data = json.loads(resp.read().decode("utf-8"))
            return {"index": idx, "status": resp.status, "elapsed_s": elapsed, "result": data}
    except Exception as e:
        elapsed = time.perf_counter() - start
        return {"index": idx, "status": "ERROR", "elapsed_s": elapsed, "error": str(e)}

def run_stress_test(concurrency: int = 10):
    print(f"[*] Starting concurrency stress test with {concurrency} workers against {BASE_URL}...")
    start_total = time.perf_counter()
    results = []

    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [
            executor.submit(send_request, i, PAYLOADS[i % len(PAYLOADS)])
            for i in range(concurrency)
        ]
        for f in futures:
            results.append(f.result())

    total_time = time.perf_counter() - start_total
    print(f"[*] Completed {len(results)} requests in {total_time:.2f}s")
    for res in results:
        status = res.get("status")
        elapsed = res.get("elapsed_s", 0)
        print(f"  - Request #{res['index']}: Status={status}, Latency={elapsed:.3f}s")

if __name__ == "__main__":
    run_stress_test(concurrency=10)

