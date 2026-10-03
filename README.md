# Department Notice Board System

A simple, full front-end web application for managing and viewing department notices.

## Features
- Public home page listing all active notices
- Filter by Department, Priority, and Search by keyword
- Click any notice to view full details in a popup
- Admin login panel (demo credentials below)
- Admin can Add / Edit / Delete notices
- Notices auto-expire based on an optional expiry date
- Data is stored in the browser's localStorage (no server/database required)

## Folder Structure
```
department-notice-board/
├── index.html    
```
(You can change these in `js/app.js` — look for `ADMIN_USER` and `ADMIN_PASS` near the top.)

## Notes
- Notice data is saved in the browser's `localStorage`, so it persists between visits on the same browser/device.
- To reset all data, open browser DevTools console and run:
  ```js
  localStorage.removeItem('dnbs_notices');
  ```
  then refresh the page — sample demo notices will be reloaded.
- This is a front-end only demo. For a production/college deployment with multiple admins
  and a shared database, the `app.js` storage functions (`getNotices`, `saveNotices`) can be
  swapped to call a backend API (Node/PHP/Django etc.) instead of localStorage.

## Tech Used
- HTML5, CSS3, Vanilla JavaScript (no frameworks, no external libraries)
