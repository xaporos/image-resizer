"use strict";

const form = document.querySelector("#img-form");
const img = document.querySelector("#add-images-input");
const outputPath = document.querySelector("#output-path");
const dropdownInput = document.querySelector("#dropdown");
const onProcessingOff = document.querySelector(".onProcessingOff");
const onProcessingOn = document.querySelector(".onProcessingOn");
const closeWindow = document.getElementById('close');
const aboutWindow = document.getElementById('about');

const imgHeight = [];
const imgWidth = [];
let resizeValue = dropdownInput.value;

// Load image and show form
function loadImage(e) {
    const file = e.target.files;

    // Check if file is an image
    if (!isFileImage(file)) {
        alertError("Please select an image");
        return;
    }

    setDimensions(file)

    // Show form, image name and output path
    form.style.display = "flex";

    // outputPath.innerText = path.join(os.homedir(), "imageresizer");
}

function setDimensions(file) {
    for (let el of file) {
        const reader = new FileReader();
        reader.readAsDataURL(el);
        reader.onload = (e) => {
            const image = new Image();
            image.src = String(e.target.result);
            image.onload = () => {
                const { height, width } = image;
                console.log(resizeValue)
                imgHeight.push(height);
                imgWidth.push(width);
            };
        };
    }
}
// Make sure file is an image
function isFileImage(file) {
    const acceptedImageTypes = ["image/gif", "image/jpeg", "image/png"];
    let isImage;
    for (let img of file) {
        isImage = acceptedImageTypes.includes(img.type);
        if (!isImage) {
            break;
        }
    }
    return isImage;
}

// Resize image
function resizeImage(e) {
    e.preventDefault();

    //Array of images paths.
    const imgPath = [];
    for (let el of img.files) {
        imgPath.push(el.path);
    }

    const opt = {
        imgPath: imgPath,
        height: imgHeight,
        width: imgWidth,
        value: resizeValue,
    };

    ipcRenderer.send("image:resize", opt);
    onProcessingOff.style.display = "none";
    onProcessingOn.style.display = "flex";
}

// When done, show message
ipcRenderer.on("image:done", () => {
    onProcessingOn.style.display = "none";
    onProcessingOff.style.display = "block";
    alertSuccess(`Images resized`);
});

function alertSuccess(message) {
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: "green",
            color: "white",
            textAlign: "center",
        },
    });
}

function alertError(message) {
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: "red",
            color: "white",
            textAlign: "center",
        },
    });
}

// File select listener
img.addEventListener("change", loadImage);
// Form submit listener - button clicked
form.addEventListener("submit", resizeImage);
// Select event listener
dropdownInput.addEventListener("change", function() {
    resizeValue = this.value
})

closeWindow.addEventListener('click', (e) => {
    ipcRenderer.send("window:close")
})

aboutWindow.addEventListener('click', (e) => {
    ipcRenderer.send('window:about')
})
    