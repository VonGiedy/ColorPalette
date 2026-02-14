// DOM ELEMENTS
const generateBtn = document.getElementById("generate-btn");
const saveBtn = document.getElementById("save-btn");
const paletteContainer = document.querySelector(".palette-container");
const savedPalettesContainer = document.querySelector("#saved-palettes-container");

// STATE
const STORAGE_KEY = "savedPalettes";

// EVENTS
generateBtn.addEventListener("click", generatePalette);
saveBtn.addEventListener("click", saveCurrentPalette);
// //
// Load saved palettes on startup, but DO NOT generate new colors yet.
// This keeps your HTML hardcoded colors visible until the button is clicked.
renderSavedPalettes();

paletteContainer.addEventListener("click", (e) => {
    //this will use copyBtn as the target
    const copyBtn = e.target.closest(".copy-btn");

    //if clicked then...
    if (copyBtn) {
        const hexValue = copyBtn.previousElementSibling.textContent;
        copyToClipboard(hexValue, copyBtn);
        return;
    }

    //if clicked then...
    const colorEl = e.target.closest(".color");
    if (colorEl) {
        const hexValue = colorEl.nextElementSibling.querySelector(".hex-value").textContent;
        const icon = colorEl.nextElementSibling.querySelector(".copy-btn");
        copyToClipboard(hexValue, icon);
    }
});

// COPY FEEDBACK
function copyToClipboard(text, icon) {
    if(!icon) return;

    //This will proceed the icon to showCopySuccess
    navigator.clipboard.writeText(text).then(() => {
        showCopySuccess(icon);
    });
}

function showCopySuccess(iconElement) {
    // 1. Change the Icon to a Checkmark
    iconElement.classList.remove("far", "fa-copy");
    iconElement.classList.add("fa-solid", "fa-check");

    // 2. Find the parent .color-info box
    const infoBox = iconElement.closest(".color-info");

    // 3. Change Background to Green and Text to White
    if (infoBox) {
        infoBox.style.backgroundColor = "#48bb78"; // Green
        infoBox.style.color = "#ffffff";           // White Text
        iconElement.style.color = "#ffffff";       // White Icon
    }

    // 4. Revert back after 1.5 seconds
    setTimeout(() => {
        // Revert Icon
        iconElement.classList.remove("fa-solid", "fa-check");
        iconElement.classList.add("far", "fa-copy");
        
        // Revert Colors
        if (infoBox) {
            infoBox.style.backgroundColor = "#fff"; // Back to White
            infoBox.style.color = "";               // Back to default (CSS handles it)
            iconElement.style.color = "";           // Back to default
        }
    }, 1500);
}

// COLOR THEORY ALGORITHMS

function generatePalette() {
    // 1. Pick a random Base Color
    const baseHue = Math.floor(Math.random() * 360);
    const baseSat = Math.floor(Math.random() * 30) + 60; // Saturation 60-90%
    const baseLight = Math.floor(Math.random() * 20) + 40; // Lightness 40-60%

    // 2. Pick a random Harmony Rule
    const harmonyRules = ["analogous", "monochromatic", "triadic", "complementary"];
    const selectedRule = harmonyRules[Math.floor(Math.random() * harmonyRules.length)];

   // console.log(Generating based on: ${selectedRule}); // Check console to see which rule was used

    // 3. Generate colors based on that rule
    let hslColors = [];

    switch (selectedRule) {
        case "analogous":
            hslColors = generateAnalogous(baseHue, baseSat, baseLight);
            break;
        case "monochromatic":
            hslColors = generateMonochromatic(baseHue, baseSat, baseLight);
            break;
        case "triadic":
            hslColors = generateTriadic(baseHue, baseSat, baseLight);
            break;
        case "complementary":
            hslColors = generateComplementary(baseHue, baseSat, baseLight);
            break;
        default:
            hslColors = generateAnalogous(baseHue, baseSat, baseLight);
    }

    // 4. Convert HSL to Hex Strings
    const hexColors = hslColors.map(c => hslToHex(c.h, c.s, c.l));
    
    updatePaletteDisplay(hexColors);
}

// --- HARMONY LOGIC ---

function generateAnalogous(h, s, l) {
    // Neighbors on the color wheel (e.g., Red, Orange-Red, Orange)
    return [
        { h: (h) % 360, s: s, l: l },
        { h: (h + 30) % 360, s: s, l: l },
        { h: (h + 60) % 360, s: s, l: l }, // Slightly lighter
        { h: (h - 30 + 360) % 360, s: s, l: l },
        { h: (h + 90) % 360, s: s, l: l + 10 } // Accent
    ];
}

function generateMonochromatic(h, s, l) {
    // Same Hue, different Lightness/Saturation
    return [
        { h: h, s: s, l: l + 20 }, // Lighter
        { h: h, s: s, l: l + 40 }, // Very Light
        { h: h, s: s, l: l },
        { h: h, s: s, l: Math.max(0, l - 20) }, // Darker
        { h: h, s: Math.max(0, s - 30), l: l + 10 } // Desaturated
    ];
}

function generateTriadic(h, s, l) {
    // Three colors evenly spaced (0, 120, 240)
    return [
        { h: h, s: s, l: l },
        { h: (h + 120) % 360, s: s, l: l },
        { h: (h + 240) % 360, s: s, l: l },
        { h: (h + 120) % 360, s: s, l: l + 20 }, // Tint of 2nd
        { h: (h + 240) % 360, s: s, l: l - 20 }  // Shade of 3rd
    ];
}

function generateComplementary(h, s, l) {
    // Opposite colors (0 and 180)
    const compH = (h + 180) % 360;
    return [
        { h: h, s: s, l: l },
        { h: h, s: s - 20, l: l + 20 }, // Lighter version of base
        { h: compH, s: s, l: l }, // The opposite
        { h: compH, s: s, l: l - 20 }, // Darker version of opposite
        { h: h, s: s, l: 15 } // Very dark version of base (Neutral)
    ];
}

// function generateCompound(h, s, l) {
//     // Base + Complement + Neighbors of complement (Split Complementary-ish)
//     const compH = (h + 180) % 360;
//     return [
//         { h: h, s: s, l: l },
//         { h: (compH - 30 + 360) % 360, s: s, l: l },
//         { h: (compH + 30) % 360, s: s, l: l },
//         { h: h, s: s, l: l + 20 },
//         { h: compH, s: s - 30, l: l + 10 }
//     ];
// }

// HELPER: HSL → HEX
function hslToHex(h, s, l) {
    s = Math.max(0, Math.min(100, s));
    l = Math.max(0, Math.min(100, l));

    s /= 100;
    l /= 100;

    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    return "#" + [f(0), f(8), f(4)]
        .map(x => Math.round(255 * x).toString(16).padStart(2, "0"))
        .join("").toUpperCase();
}

// UI UPDATE
function updatePaletteDisplay(colors) {

    //this will change the color in the container
    document.querySelectorAll(".color-box").forEach((box, index) => {
        if(box && colors[index]) {
            box.querySelector(".color").style.backgroundColor = colors[index];
            box.querySelector(".hex-value").textContent = colors[index];
        }
    });
}

// SAVE PALETTES
function saveCurrentPalette() {

    //grabs all elements showing hex values on the page.
    //It returns a NodeList (array-like, but not a real array).
    const palette = [...document.querySelectorAll(".hex-value")]
        .map(el => el.textContent);

    //load the local storage
    const saved = getSavedPalettes();
    
    // Check for duplicates
    const isDuplicate = saved.some(p => JSON.stringify(p) === JSON.stringify(palette));
    if (isDuplicate) {
        alert("This palette is already saved!");
        return;
    }

    //will add to the local storage
    saved.push(palette);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    renderSavedPalettes();
}

function getSavedPalettes() {
    //get the value from the local storage
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function renderSavedPalettes() {

    //this is for adding to the created container
    const palettes = getSavedPalettes();

    //this will hide the container for the palette beside the color body container

    if (palettes.length === 0) {
        savedPalettesContainer.classList.add("hidden");
        savedPalettesContainer.innerHTML = "";
        return;
    }

    //this will remove hidden from html id and will proceed to render the css style

    savedPalettesContainer.classList.remove("hidden");
    savedPalettesContainer.innerHTML = "";

    palettes.forEach((palette, index) => {
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.style.marginBottom = "10px";
        wrapper.style.gap = "6px";
        wrapper.style.justifyContent = "space-between"; 
        wrapper.style.borderRadius = "20px";
        wrapper.style.border = "5px solid";
        wrapper.style.borderColor = "transparent";

        const icon = document.createElement("i");
        icon.className = "fa fa-save";
        icon.style.color = "#eff4f1";

        // 1. CREATE THE CALL BUTTON
        // const callBtn = document.createElement("button");
        // callBtn.textContent = "load";
        // callBtn.style.cursor = "pointer";
        // callBtn.style.padding = "4px 8px";
        // callBtn.style.borderRadius = "4px";
        // callBtn.style.border = "none";
        // callBtn.style.backgroundColor = "#0c2c64";
        // callBtn.style.color = "white";
        // callBtn.style.fontSize = "0.75rem";
        // callBtn.style.fontWeight = "bold";
        // callBtn.style.transition = "all 0.2s ease";
    

        // 2. CREATE COLOR SWATCHES GROUP

        const swatchGroup = document.createElement("div");
        swatchGroup.style.display = "flex";
        swatchGroup.style.gap = "4px";
        swatchGroup.borderRadius = "20px";

        palette.forEach(color => {
            const swatch = document.createElement("div");
            swatch.style.width = "30px";
            swatch.style.height = "30px";
            swatch.style.borderRadius = "6px";
            swatch.style.backgroundColor = color;
            swatchGroup.appendChild(swatch);
        });

           icon.onclick = () => {
            // Update the main UI
            updatePaletteDisplay(palette);

            // Visual Feedback
            // const originalText = callBtn.textContent;
            // const originalBg = callBtn.style.backgroundColor;
            
            icon.className = "fa fa-check";
            icon.style.color = "#17a90a"; // Success Green
            delBtn.style.color = "#180101";
            wrapper.style.backgroundColor = "rgb(245, 250, 247)";
            // wrapper.style.padding = "5px";
            wrapper.style.transition = 
            "background-color 0.3s ease";
            wrapper.style.border = "5px solid white";
           
            
            setTimeout(() => {
                icon.className = "fa fa-save";
                icon.style.color = "#eff4f1";
                wrapper.style.backgroundColor = "";
                delBtn.style.color = "#FF0000";
                wrapper.style.border = "5px solid";
                wrapper.style.borderColor = "transparent";

                // wrapper.style.padding = "";
            }, 1000);
        };

        // 3. CREATE DELETE BUTTON
        const delBtn = document.createElement("button");
        delBtn.textContent = "✕";
        delBtn.style.cursor = "pointer";
        delBtn.style.background = "none";
        delBtn.style.border = "none";
        delBtn.style.fontSize = "1.2rem";
        delBtn.style.color = "#FF0000";
        delBtn.onclick = () => deletePalette(index);

        // ASSEMBLY
        wrapper.appendChild(icon);    
        wrapper.appendChild(swatchGroup); 
        wrapper.appendChild(delBtn);     
        
        // this will be added to the div container for the saved palettes
        savedPalettesContainer.appendChild(wrapper);
    });
}

function deletePalette(index) {
    const palettes = getSavedPalettes();
    palettes.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes));
    renderSavedPalettes();
}