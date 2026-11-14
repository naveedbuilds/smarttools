
const qrInput = document.getElementById("qrInput");
const generateQR = document.getElementById("generateQR");
const downloadQR = document.getElementById("downloadQR");
const qrCodeBox = document.getElementById("qrcode");
const qrMessage = document.getElementById("qrMessage");

generateQR.addEventListener("click", function () {
  const text = qrInput.value.trim();

  if (text === "") {
    qrMessage.textContent = "Please enter a link or text!";
    downloadQR.hidden = true;
    qrCodeBox.innerHTML = "";
    return;
  }

  if (typeof QRCode === "undefined") {
    qrMessage.textContent = "QR Code library load nahi hui. Internet check karo.";
    downloadQR.hidden = true;
    return;
  }

  qrCodeBox.innerHTML = "";

  new QRCode(qrCodeBox, {
    text: text,
    width: 220,
    height: 220,
    correctLevel: QRCode.CorrectLevel.H
  });

  qrMessage.textContent = "Your QR code is ready!";
  downloadQR.hidden = false;
});

downloadQR.addEventListener("click", function () {
  const canvas = qrCodeBox.querySelector("canvas");

  if (!canvas) {
    qrMessage.textContent = "QR code is not ready yet.";
    return;
  }

  const link = document.createElement("a");
  link.download = "smarttools-qr-code.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

const passwordLength = document.getElementById("passwordLength");
const passwordOutput = document.getElementById("passwordOutput");
const generatePassword = document.getElementById("generatePassword");
const copyPassword = document.getElementById("copyPassword");
const passwordMessage = document.getElementById("passwordMessage");

function secureRandomIndex(max) {
  const range = 0x100000000;
  const limit = Math.floor(range / max) * max;
  const randomValue = new Uint32Array(1);

  do {
    crypto.getRandomValues(randomValue);
  } while (randomValue[0] >= limit);

  return randomValue[0] % max;
}

generatePassword.addEventListener("click", function () {
  const length = Number(passwordLength.value);

  if (!Number.isInteger(length) || length < 8 || length > 64) {
    passwordMessage.textContent = "Length 8 se 64 ke darmiyan rakho.";
    passwordOutput.value = "";
    return;
  }

  const groups = ["abcdefghijklmnopqrstuvwxyz"];

  if (document.getElementById("includeUppercase").checked) {
    groups.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  }

  if (document.getElementById("includeNumbers").checked) {
    groups.push("0123456789");
  }

  if (document.getElementById("includeSymbols").checked) {
    groups.push("!@#$%^&*_-+=");
  }

  try {
    const allCharacters = groups.join("");
    const passwordArray = [];

    // Har selected category se kam az kam ek character
    groups.forEach(function (group) {
      passwordArray.push(group[secureRandomIndex(group.length)]);
    });

    // Baqi password fill karo
    while (passwordArray.length < length) {
      passwordArray.push(
        allCharacters[secureRandomIndex(allCharacters.length)]
      );
    }

    // Characters ko random order mein shuffle karo
    for (let i = passwordArray.length - 1; i > 0; i--) {
      const j = secureRandomIndex(i + 1);
      [passwordArray[i], passwordArray[j]] =
        [passwordArray[j], passwordArray[i]];
    }

    passwordOutput.value = passwordArray.join("");
    passwordMessage.textContent = "Strong password generated successfully!";

  } catch (error) {
    passwordOutput.value = "";
    passwordMessage.textContent = "Password generation failed. Please try again.";
  }
});

copyPassword.addEventListener("click", async function () {
  if (passwordOutput.value === "") {
    passwordMessage.textContent = "Pehle password generate karo.";
    return;
  }

  try {
    await navigator.clipboard.writeText(passwordOutput.value);
    passwordMessage.textContent = "Password copied successfully!";
  } catch (error) {
    passwordMessage.textContent = "Copy nahi hua. Password manually copy karo.";
  }
});


const wordInput = document.getElementById("wordInput");
const wordCount = document.getElementById("wordCount");
const characterCount = document.getElementById("characterCount");
const sentenceCount = document.getElementById("sentenceCount");
const clearText = document.getElementById("clearText");

wordInput.addEventListener("input", function () {
  const text = wordInput.value;

  const words = text.trim() === ""
    ? []
    : text.trim().split(/\s+/);

  const sentences = text.trim() === ""
    ? []
    : text.trim().split(/[.!?]+/).filter(s => s.trim() !== "");

  wordCount.textContent = words.length;
  characterCount.textContent = text.length;
  sentenceCount.textContent = sentences.length;
});

clearText.addEventListener("click", function () {
  wordInput.value = "";
  wordCount.textContent = 0;
  characterCount.textContent = 0;
  sentenceCount.textContent = 0;
});


const imageInput = document.getElementById("imageInput");
const imageQuality = document.getElementById("imageQuality");
const qualityValue = document.getElementById("qualityValue");
const compressImage = document.getElementById("compressImage");
const imageMessage = document.getElementById("imageMessage");
const originalSize = document.getElementById("originalSize");
const compressedSize = document.getElementById("compressedSize");
const compressedPreview = document.getElementById("compressedPreview");
const downloadImage = document.getElementById("downloadImage");

let selectedImage = null;
let originalImageURL = null;
let compressedImageURL = null;

function formatSize(bytes) {
  return (bytes / 1024).toFixed(2) + " KB";
}

imageQuality.addEventListener("input", function () {
  qualityValue.textContent = imageQuality.value + "%";
});

imageInput.addEventListener("change", function () {
  const file = imageInput.files[0];

  selectedImage = null;
  compressImage.disabled = true;
  originalSize.textContent = "Original size: Not selected";
  compressedSize.textContent = "";
  imageMessage.textContent = "";
  compressedPreview.hidden = true;
  downloadImage.hidden = true;

  if (originalImageURL) {
    URL.revokeObjectURL(originalImageURL);
    originalImageURL = null;
  }

  if (compressedImageURL) {
    URL.revokeObjectURL(compressedImageURL);
    compressedImageURL = null;
  }

  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
  imageMessage.textContent = "Please select an image smaller than 10 MB.";
  return;
}

  if (!file.type.startsWith("image/")) {
    imageMessage.textContent = "Please select a valid image.";
    return;
  }

  selectedImage = file;
  originalImageURL = URL.createObjectURL(file);

  originalSize.textContent =
    "Original size: " + formatSize(file.size);

  compressImage.disabled = false;
  imageMessage.textContent = "Image size must be 10 MB or less.";
});

compressImage.addEventListener("click", function () {
  if (!selectedImage) return;
  const imageFile = selectedImage;
const imageURL = originalImageURL;

  compressImage.disabled = true;
  imageMessage.textContent = "Compressing image...";

  const img = new Image();

  img.onload = function () {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    context.drawImage(img, 0, 0);

    const quality = Number(imageQuality.value) / 100;

    canvas.toBlob(function (blob) {
      compressImage.disabled = false;

      if (!blob) {
        imageMessage.textContent = "Image compression failed.";
        return;
      }

      if (compressedImageURL) {
        URL.revokeObjectURL(compressedImageURL);
      }

      compressedImageURL = URL.createObjectURL(blob);

      const difference = imageFile.size - blob.size;

      downloadImage.hidden = false;

      if (difference > 0) {
      const reduction = (difference / imageFile.size) * 100;

        compressedPreview.src = compressedImageURL;
        compressedSize.textContent =
  "Compressed size: " + formatSize(blob.size);

        imageMessage.textContent =
          "Image reduced by " + reduction.toFixed(1) + "%";

        downloadImage.href = compressedImageURL;
        downloadImage.download = "smarttools-compressed.webp";

      } else {
        compressedPreview.src = imageURL;
        compressedSize.textContent =
          "Original size: " + formatSize(imageFile.size);

        imageMessage.textContent =
          "Compression did not reduce the file size. Original image selected.";

        downloadImage.href = imageURL;
downloadImage.download = imageFile.name;
      }

      compressedPreview.hidden = false;

    }, "image/webp", quality);
  };

  img.onerror = function () {
    compressImage.disabled = false;
    imageMessage.textContent = "Could not load this image.";
  };

 img.src = imageURL;
});
// Mobile Navigation Menu
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", function () {
  navLinks.classList.toggle("active");

  const isOpen = navLinks.classList.contains("active");

  menuToggle.textContent = isOpen ? "✕" : "☰";
  menuToggle.setAttribute("aria-expanded", isOpen);
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu"
  );
});

// Close menu when a navigation link is clicked
navLinks.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", function () {
    navLinks.classList.remove("active");
    menuToggle.textContent = "☰";
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  });
});
