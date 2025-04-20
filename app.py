from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
import json
import mysql.connector
import os
import re
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles
import jwt
app=FastAPI()

# 提供 static 資料夾內的靜態檔案
app.mount("/static", StaticFiles(directory="static"), name="static")

load_dotenv()
mydb = mysql.connector.connect(
  host=os.getenv("DB_HOST"),
  user=os.getenv("DB_USER"),
  password=os.getenv("DB_PASSWORD"),
  database=os.getenv("DB_NAME")
)
# cursor = mydb.cursor(dictionary=True)

# Static Pages (Never Modify Code in this Block)
@app.get("/", include_in_schema=False)
async def index(request: Request):
	return FileResponse("./static/index.html", media_type="text/html")
@app.get("/attraction/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
	return FileResponse("./static/attraction.html", media_type="text/html")
@app.get("/booking", include_in_schema=False)
async def booking(request: Request):
	return FileResponse("./static/booking.html", media_type="text/html")
@app.get("/thankyou", include_in_schema=False)
async def thankyou(request: Request):
	return FileResponse("./static/thankyou.html", media_type="text/html")

@app.get("/api/attraction/{id}")
async def get_attraction_id(id: int):
  cursor = mydb.cursor(dictionary=True)
  cursor.execute("SELECT * FROM attractions WHERE id = %s", (id,))
  attraction = cursor.fetchone()
  
  data = {
    "id": attraction["id"],
    "name": attraction["name"],
    "category": attraction["category"],
    "description": attraction["description"],
    "address": attraction["address"],
    "transport": attraction["transport"],
    "mrt": attraction["mrt"],
    "lat": float(attraction["lat"]),
    "lng": float(attraction["lng"]),
    "images": json.loads(attraction["images"])
  }
  return JSONResponse(content={"data": data})

@app.get("/api/attractions")
async def get_attractions(
  page: int = Query(0, ge=0),  # 頁數，從 0 開始
  keyword: str = Query(None)   # 搜尋關鍵字，可為 None
):
  cursor = mydb.cursor(dictionary=True)
  limit = 12  # 每頁 12 筆
  offset = page * limit #計算跳過的頁數
  sql = "SELECT * FROM attractions"
  params = []
  if keyword:
    sql += " WHERE name LIKE %s OR mrt LIKE %s"
    params.extend([f"%{keyword}%", f"%{keyword}%"])
  sql += " LIMIT %s OFFSET %s"
  params.extend([limit, offset])
  cursor.execute(sql, params)
  attractions = cursor.fetchall()

  data = []
  for attraction in attractions:
    data.append({
      "id": attraction["id"],
      "name": attraction["name"],
      "category": attraction["category"],
      "description": attraction["description"],
      "address": attraction["address"],
      "transport": attraction["transport"],
      "mrt": attraction["mrt"],
      "lat": float(attraction["lat"]),
      "lng": float(attraction["lng"]),
      "images": json.loads(attraction["images"])
    })

    # 檢查是否還有下一頁
    next_page = page + 1 if len(data) == limit else None
  return JSONResponse(content={"nextPage": next_page, "data": data})

@app.get("/api/mrts")
async def get_mrts():
  cursor = mydb.cursor(dictionary=True)
  cursor.execute("""
    SELECT mrt, COUNT(*) AS attraction_count 
    FROM attractions 
    WHERE mrt IS NOT NULL AND mrt != '' 
    GROUP BY mrt 
    ORDER BY attraction_count DESC;
  """)
  mrt_list = cursor.fetchall()
  data = [row["mrt"] for row in mrt_list]  
  return JSONResponse(content={"data": data})


# cursor = mydb.cursor(dictionary=True)
# #建立table
# cursor.execute("""
#   CREATE TABLE attractions (
#     id INT AUTO_INCREMENT PRIMARY KEY,
#     name VARCHAR(255) NOT NULL,
#     category VARCHAR(255),
#     description TEXT,
#     address VARCHAR(255),
#     transport TEXT,
#     mrt VARCHAR(255),
#     lat DECIMAL(10, 6),
#     lng DECIMAL(10, 6),
#     images JSON
#   );
# """)

# # 讀取 JSON
# with open("data/taipei-attractions.json", "r", encoding="utf-8") as file:
#   data = json.load(file)
  
# # 解析 JSON
# for item in data["result"]["results"]:
#   name = item["name"]
#   category = item["CAT"]
#   description = item["description"]
#   address = item["address"]
#   transport = item["direction"]
#   mrt = item["MRT"]
#   lat = float(item["latitude"])
#   lng = float(item["longitude"])
#   # 原始網址字串
#   raw_urls = item["file"]
#   # 使用正則表達式根據 "https://" 來分割，但保留 "https://"
#   image_urls = re.split(r"https://", raw_urls)
#   # 移除空字串並補回 "https://"
#   image_urls = ["https://" + url.replace("\\", "") for url in image_urls if url]
#   valid_image_urls = [url for url in image_urls if url.endswith(('.jpg', '.png'))]
#   # 轉成 JSON 格式
#   images_json = json.dumps(valid_image_urls, ensure_ascii=False)

# # 插入資料
#   cursor.execute("""
#     INSERT INTO attractions (name, category, description, address, transport, mrt, lat, lng, images)
#     VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""", 
#   (name, category, description, address, transport, mrt, lat, lng, images_json))

# 建立 user 資料表
# cursor.execute("""
#   CREATE TABLE users (
#     id INT AUTO_INCREMENT PRIMARY KEY,
#     name VARCHAR(255) NOT NULL,
#     email VARCHAR(255) NOT NULL UNIQUE,
#     password VARCHAR(255) NOT NULL
#   );
# """)

# 提交變更
# mydb.commit()
# cursor.close()
# mydb.close()

# encoded = jwt.encode({"name":"昭"}, "ann", algorithm="HS256")
# print(encoded)
# decoded = jwt.decode(encoded, "ann", algorithms=["HS256"])
# print(decoded)
SECRET_KEY = os.getenv("SECRET_KEY")
# JWT 加密 token
def create_token(data: dict):
  return jwt.encode(data, SECRET_KEY, algorithm="HS256")
# 解密
def verify_token(token: str):
  try:
    return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
  except:
    return None

# 註冊
@app.post("/api/user")
def signup(name: str = Form(...), email: str = Form(...), password: str = Form(...)):
  cursor = mydb.cursor(dictionary=True)
  try:
    cursor.execute(
      "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
        (name, email, password)
    )
    mydb.commit()
    return {"ok": True,"message": "註冊成功，請登入系統"}
  except mysql.connector.errors.IntegrityError:
    return JSONResponse(content={"error": True, "message": "Email已經註冊帳戶"}, status_code=400)

# 登入
# 2. When a user tries to sign in, our back-end code checks if the pair of email and
# password exists in the database. If yes, encode user id, name, email, and other
# critical information by JWT encoding mechanism and send a signed TOKEN back to
# the front-end.
@app.put("/api/user/auth")
def signin(email: str = Form(...), password: str = Form(...)):
  cursor = mydb.cursor(dictionary=True)
  cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
  user = cursor.fetchone()
  if user and user["password"] == password:
    token = create_token({
      "id": user["id"],
      "name": user["name"],
      "email": user["email"]
    })
    return {"token": token}
  return JSONResponse(content={"error": True, "message": "電子郵件或密碼輸入錯誤"}, status_code=400)

# 驗證使用者
# 5. Once our back-end code receives a request from the front-end, get TOKEN from the
# Authorization header, and then, decode and verify received TOKEN by JWT
# decoding mechanism. If failed to decode or verify it, it means it’s an unauthorized
# request which should be rejected. Else, our back-end code can get critical user
# information which is saved in the previous signing-in procedure.
@app.get("/api/user/auth")
def get_user_auth(authorization: str = Header(None)):
  cursor = mydb.cursor(dictionary=True)
  if not authorization.startswith("Bearer "):
    return {"data": None}
  token = authorization.split(" ")[1]
  user_data = verify_token(token)
  if not user_data:
    return {"data": None}
  return {"data": user_data}