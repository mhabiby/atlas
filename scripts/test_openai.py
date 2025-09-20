import os
import traceback
import requests

key = os.getenv("OPENAI_API_KEY")
print("OPENAI_API_KEY present:", bool(key))

print("\n-- Direct SDK-independent ChatCompletion test using REST --")
if not key:
    print("OPENAI_API_KEY not set; aborting REST test.")
else:
    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": "Say hello in one short sentence."}],
            "max_tokens": 16,
            "temperature": 0.0
        }
        r = requests.post(url, headers=headers, json=payload, timeout=15)
        print("Status:", r.status_code)
        try:
            j = r.json()
            print("Response JSON snippet:", j.get("choices", [{}])[0].get("message", {}).get("content", "").strip())
        except Exception:
            print("Non-JSON response:", r.text[:1000])
    except Exception as e:
        print("REST call failed:", type(e).__name__, str(e))
        print(traceback.format_exc())

print("\n-- Direct HTTPS connectivity check (models list) --")
if not key:
    print("Skipping direct check because OPENAI_API_KEY not set.")
else:
    try:
        resp = requests.get(
            "https://api.openai.com/v1/models",
            headers={"Authorization": f"Bearer {key}"},
            timeout=10
        )
        print("Direct request status:", resp.status_code)
        print(resp.text[:1000])
    except Exception as e:
        print("Direct request failed:", type(e).__name__, str(e))
        print(traceback.format_exc())