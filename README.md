# Green Hell 3D v1.0

以「Sacks Prime Analyzer」同樣的逐版迭代方式製作的第一版 3D 賽車遊戲原型。

## v1.0
- Three.js 3D 場景
- Nordschleife 風格完整封閉賽道
- 高低差
- 車輛加速、煞車、轉向、倒車
- 草地減速
- 三種鏡頭
- 圈速、最佳圈、速度、檔位、進度 HUD
- 最佳圈寫入瀏覽器 localStorage
- R 重置、P 暫停
- 森林、路肩、起跑架

## 執行
因為使用 ES Module 與 Three.js CDN，請不要直接雙擊 file:// 開啟。

最簡單：
1. 在此資料夾開啟終端機
2. 執行：python -m http.server 8080
3. 瀏覽器開啟 http://localhost:8080

## 下一版建議
v1.1：更精確 Nordschleife 幾何、碰撞護欄、檢查點防作弊
v1.2：車輛動力/輪胎/煞車溫度
v1.3：AI 對手與計時賽
v1.4：天氣、濕地、夜間
v2.0：Windows/Android 打包
