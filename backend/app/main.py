from fastapi import FastAPI
from .routers.quilts import quilts

app = FastAPI()

# 注册路由
app.include_router(quilts.router)