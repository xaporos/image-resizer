"use strict";

const path = require("path");
const os = require("os");
const fs = require("fs");
const resizeImg = require("resize-img");
const { app, BrowserWindow, Menu, ipcMain, shell, ipcRenderer } = require("electron");

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

let mainWindow;
let aboutWindow;

// const close = document.querySelector('#close');

// Main Window
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: isDev ? 1000 : 500,
        height: 600,
        icon: `${__dirname}/assets/icons/anchor-67.png`,
        resizable: isDev,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"),
        },
    });

    // Show devtools automatically if in development
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    // mainWindow.loadURL(`file://${__dirname}/renderer/index.html`);
    mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

ipcMain.on('window:about', createAboutWindow);

// About Window
function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        width: 300,
        height: 300,
        title: "About Image Resizer",
        icon: `${__dirname}/assets/icons/anchor-67.png`,
    });

    aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

// When the app is ready, create the window
app.on("ready", () => {
    createMainWindow();
    // Remove variable from memory
    mainWindow.on("closed", () => (mainWindow = null));

});

// Respond to the resize image event
ipcMain.on("image:resize", (e, options) => {
    options.dest = path.join(os.homedir(), "imageresizer");
    resizeImage(options);
});

// Resize and save image
async function resizeImage({ imgPath, height, width, dest, value }) {
    try {
        // Resize image
        for (let i = 0; i < imgPath.length; i++) {
            const newPath = await resizeImg(fs.readFileSync(imgPath[i]), {
                width: width[i]*value,
                height: height[i]*value,
            });

            const filename = path.basename(imgPath[i]);

            // Create destination folder if it doesn't exist
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest);
            }

            // Write the file to the destination folder
            fs.writeFileSync(path.join(dest, filename), newPath);
        }

        // Send success to renderer
        mainWindow.webContents.send("image:done");

        // Open the folder in the file explorer
       
        shell.openPath(dest);
        
        
    } catch (err) {
        console.log(err);
    }
}

ipcMain.on('window:close', closeWindow)

function closeWindow() {
    let window = BrowserWindow.getFocusedWindow();
    window.close();
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    if (!isMac) app.quit();
});

// Open a window if none are open (macOS)
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});
