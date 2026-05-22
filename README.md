# 🔧 Piping Monitor Dashboard — Hydrotest & NDT Inspection

Real-time multi-user dashboard for piping welding inspection, NDT tracking, and hydrotest clearance monitoring.

## Features

- 📊 **Overview Dashboard** — KPIs, Production Volume, Repair Rate charts
- 🔬 **NDT Random Inspection Control** — Progressive examination tracking
- 💧 **Hydrotest Clearance Tracker** — Test package status monitoring
- 📅 **Daily Production Log** — Welding productivity by subcontractor
- 👷 **Welder Performance** — Defect rate analysis & heatmap
- ☁️ **Cloud Sync** — Firebase Realtime DB & Google Sheets integration
- 📱 **Responsive** — Works on desktop, tablet, mobile

## Deployment

This dashboard is deployed on **Vercel** as a static site.

### How to use

1. Open the dashboard URL
2. Upload your Excel data file OR use Cloud Sync
3. Apply filters and explore the dashboard

### For Admin (Data Provider)

1. Upload Excel data via sidebar
2. Go to **Firebase Sync** section → Configure Firebase project
3. Click **Push to Cloud** → All viewers will receive data automatically

### For Viewers

1. Open the dashboard URL
2. Go to **Firebase Sync** → Enter same Firebase project info
3. Set mode to **Viewer** → Data syncs automatically

## Tech Stack

- HTML5 + Vanilla JavaScript
- Bootstrap 5 + Chart.js
- SheetJS + ExcelJS (Excel processing)
- Firebase Realtime Database (cloud sync)
- Deployed on Vercel via GitHub
