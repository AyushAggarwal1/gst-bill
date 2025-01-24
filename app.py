from fastapi import FastAPI, HTTPException, Request
import json
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

@app.post("/save-invoice")
async def save_invoice(request: Request):
    try:
        data = await request.json()
        print("Received payload:", data)

        # Validate input
        if not data.get("invoiceNo"):
            return {"message": "Invoice number is missing"}  # Graceful response
        if not data.get("date") or "undefined" in data.get("date"):
            return {"message": "Valid date is required"}

        # Simulate saving to file
        with open("invoices.txt", "a") as file:
            file.write(json.dumps(data) + "\n")

        # Success response
        return {"message": "Invoice saved successfully"}
    except Exception as e:
        print(f"An error occurred: {e}")
        return {"message": f"An error occurred: {str(e)}"}  # Ensure JSON is returned


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with your frontend's origin in production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)