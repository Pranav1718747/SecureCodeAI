class MockPatch:
    ai_response_json = None

patch = MockPatch()
try:
    if patch.ai_response_json:
        print("Inside if")
except Exception as e:
    print("Caught:", e)
