# Green Hell 3D v1.1 (Optimized)

以「Sacks Prime Analyzer」同樣的逐版迭代方式製作的 3D 賽車遊戲優化版。

## v1.1 新增功能與改進
- **動態車輛姿態與貼地**：車輛現在會隨賽道高低差與坡度自動進行 Pitch / Roll 姿態傾斜。
- **車輪動畫**：前輪隨轉向動態偏轉，四輪隨車速實時轉動。
- **檢查點防作弊機制 (Checkpoints)**：新增賽道 Checkpoint 驗證，防止倒車或截彎取直橫跨草地刷單圈成績。
- **物理與轉向平滑度提升**。

## v1.0 基礎功能
- Three.js 3D 場景與 Nordschleife 風格封閉賽道
- 草地減速、三種鏡頭視角
- 圈速、最佳圈、速度、檔位、進度 HUD 與 localStorage 紀錄

## 執行方式
1. 解壓縮檔案
2. 開啟終端機並執行：`python -m http.server 8080`
3. 瀏覽器訪問：`http://localhost:8080`
