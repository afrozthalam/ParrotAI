// PARROT.ai — Premium Split-Workspace Application Logic

document.addEventListener("DOMContentLoaded", () => {
    const ENHANCE_SUFFIX = ", (Real photo:1.5), (candid amateur snapshot:1.4), raw unedited documentary photography, caught in the moment, fleeting natural gesture, (authentic human imperfections:1.3), natural micro-expressions, true asymmetrical facial features, (highly detailed authentic skin texture, visible pores, faint fine lines, peach fuzz, subtle skin blemishes, natural uneven pigmentation:1.4), relaxed unposed posture, normal everyday clothing textures, realistic fabric drapery and physics, lived-in environmental details, subtle digital camera noise, slight 2010s smartphone camera artifacts, realistic depth of field, authentic ambient light integration, no staged composition, unpolished, raw reality, amateur family photo album aesthetic, mundane everyday life.";

    const NEGATIVE_SUFFIX = "(CGI, 3D render, Unreal Engine, Octane Render, digital art, painting, illustration, anime, cartoon, sketch, vector:1.5), (plastic skin, heavily retouched, airbrushed, over-smoothed, flawless poreless skin, heavy cosmetics, beauty filter, Instagram filter:1.4), (professional studio lighting, softbox, artificial rim lighting, dramatic cinematic lighting, high-end commercial photoshoot, fashion editorial, Vogue cover:1.4), stiff body language, heavily posed, forced artificial smile, perfect facial symmetry, uncanny valley, mannequin, doll-like, (deformed anatomy, extra fingers, missing fingers, fused digits, mangled hands, extra limbs, missing limbs, disconnected appendages, floating limbs, bad proportions, distorted bone structure, elongated neck, amputee:1.5), cloned faces, cross-eyed, blurry, low resolution, extreme pixelation, watermark, signature, text, UI elements, fake green screen background, sterile empty void, oversaturated colors, HDR nightmare, overly crisp artificial edges.";
    function appendSuffix(textarea, suffix) {
        let currentText = textarea.value.trim();
        if (!currentText) {
            let cleanSuffix = suffix.trim();
            if (cleanSuffix.startsWith(",")) {
                cleanSuffix = cleanSuffix.substring(1).trim();
            }
            textarea.value = cleanSuffix;
        } else {
            const testSuffix = suffix.trim().substring(0, 30);
            if (currentText.includes(testSuffix)) {
                return;
            }
            if (!currentText.endsWith(",")) {
                currentText += ", ";
            } else {
                currentText += " ";
            }
            let cleanSuffix = suffix.trim();
            if (cleanSuffix.startsWith(",")) {
                cleanSuffix = cleanSuffix.substring(1).trim();
            }
            textarea.value = currentText + cleanSuffix;
        }
        textarea.dispatchEvent(new Event("input"));
    }

    // Curated list of high-quality premium prompts
    const promptIdeas = [
        "a magnificent celestial phoenix rising from cosmic fire, nebula, galaxy background, digital art masterpiece, 8k resolution, ultra detailed",
        "a gorgeous futuristic cyberpunk city at night, glowing neon billboards, flying cars, heavy rain, reflection, style of blade runner, highly detailed",
        "a cute fluffy kitten wearing a wizard hat casting a spell, glowing magical particles, cozy library background, cinematic lighting, 3d render",
        "photorealistic portrait of a majestic elven queen wearing a silver crown, forest background, soft sunlight, ethereal, extremely detailed, portrait lens",
        "an ancient medieval castle built on top of a floating rock island, waterfalls cascading into clouds, glowing sunset, epic fantasy concept art, high detail",
        "a beautiful underwater world, glowing bioluminescent sea plants, schools of mystical fish, ancient ruins, sun rays filtering through water, cinematic art",
        "steampunk explorer flying a brass hot air balloon above mountains, mechanical details, dramatic clouds, style of retro-futurism, highly detailed",
        "a serene Japanese Zen garden in autumn, red maple leaves falling, a small bridge over a stream, soft morning fog, peaceful, photorealistic"
    ];

    // Full 106 Perchance Style Themes Options extracted directly from generator DOM
    const perchanceStyles = [
        { "value": "ref:optionKeyName:Painted Anime Plus", "text": "🎨 Painted Anime Plus" },
        { "value": "ref:optionKeyName:Painted Anime", "text": "🎨 Painted Anime" },
        { "value": "ref:optionKeyName:Casual Photo", "text": "📸 Casual Photo" },
        { "value": "ref:optionKeyName:Cinematic", "text": "🎬 Cinematic" },
        { "value": "ref:optionKeyName:Digital Painting", "text": "🖥️ Digital Painting" },
        { "value": "ref:optionKeyName:Realistic images", "text": "🌟 Realistic images" },
        { "value": "ref:optionKeyName:Realistic humans", "text": "🧑 Realistic humans" },
        { "value": "ref:optionKeyName:𝗡𝗼 𝘀𝘁𝘆𝗹𝗲", "text": "✨ No Style (Default)" },
        { "value": "ref:optionKeyName:Anti-NSFW", "text": "🛡️ Anti-NSFW Safe" },
        { "value": "ref:optionKeyName:League of Legends", "text": "⚔️ League of Legends" },
        { "value": "ref:optionKeyName:Concept Art", "text": "📐 Concept Art" },
        { "value": "ref:optionKeyName:3D Disney Character", "text": "🏰 3D Disney" },
        { "value": "ref:optionKeyName:2D Disney Character", "text": "🏰 2D Disney" },
        { "value": "ref:optionKeyName:Disney Sketch", "text": "✏️ Disney Sketch" },
        { "value": "ref:optionKeyName:Concept Sketch", "text": "✏️ Concept Sketch" },
        { "value": "ref:optionKeyName:Painterly", "text": "🖌️ Painterly" },
        { "value": "ref:optionKeyName:Oil Painting", "text": "🎨 Oil Painting" },
        { "value": "ref:optionKeyName:Oil Painting - Realism", "text": "🎨 Oil Realism" },
        { "value": "ref:optionKeyName:Oil Painting - Old", "text": "🎨 Oil Antique" },
        { "value": "ref:optionKeyName:Professional Photo", "text": "📷 Professional Photo" },
        { "value": "ref:optionKeyName:Anime", "text": "🎌 Anime" },
        { "value": "ref:optionKeyName:Drawn Anime", "text": "🎌 Drawn Anime" },
        { "value": "ref:optionKeyName:Cute Anime", "text": "🎌 Cute Anime" },
        { "value": "ref:optionKeyName:Soft Anime", "text": "🎌 Soft Anime" },
        { "value": "ref:optionKeyName:Mix Anime", "text": "🎌 Mix Anime" },
        { "value": "ref:optionKeyName:Fantasy Painting", "text": "🐉 Fantasy Painting" },
        { "value": "ref:optionKeyName:Fantasy Landscape", "text": "🏔️ Fantasy Landscape" },
        { "value": "ref:optionKeyName:Fantasy Portrait", "text": "🧙 Fantasy Portrait" },
        { "value": "ref:optionKeyName:Studio Ghibli", "text": "🚂 Studio Ghibli" },
        { "value": "ref:optionKeyName:50s Enamel Sign", "text": "💈 50s Enamel Sign" },
        { "value": "ref:optionKeyName:Vintage Comic", "text": "📖 Vintage Comic" },
        { "value": "ref:optionKeyName:Franco-Belgian Comic", "text": "📖 Franco-Belgian" },
        { "value": "ref:optionKeyName:Tintin Comic", "text": "📖 Tintin Comic" },
        { "value": "ref:optionKeyName:90s Comic", "text": "📖 90s Comic" },
        { "value": "ref:optionKeyName:90s Superhero", "text": "🦸 90s Superhero" },
        { "value": "ref:optionKeyName:Medieval", "text": "🛡️ Medieval Age" },
        { "value": "ref:optionKeyName:Pixel Art", "text": "👾 Pixel Art" },
        { "value": "ref:optionKeyName:Cute Figurine", "text": "🧸 Cute Figurine" },
        { "value": "ref:optionKeyName:3D Emoji", "text": "😀 3D Emoji" },
        { "value": "ref:optionKeyName:Illustration", "text": "📔 Illustration" },
        { "value": "ref:optionKeyName:Flat Illustration", "text": "📔 Flat Illustration" },
        { "value": "ref:optionKeyName:Watercolor", "text": "💧 Watercolor" },
        { "value": "ref:optionKeyName:1990s Photo", "text": "🎞️ 1990s Photo" },
        { "value": "ref:optionKeyName:1980s Photo", "text": "🎞️ 1980s Photo" },
        { "value": "ref:optionKeyName:1970s Photo", "text": "🎞️ 1970s Photo" },
        { "value": "ref:optionKeyName:1960s Photo", "text": "🎞️ 1960s Photo" },
        { "value": "ref:optionKeyName:1950s Photo", "text": "🎞️ 1950s Photo" },
        { "value": "ref:optionKeyName:1940s Photo", "text": "🎞️ 1940s Photo" },
        { "value": "ref:optionKeyName:1930s Photo", "text": "🎞️ 1930s Photo" },
        { "value": "ref:optionKeyName:1920s Photo", "text": "🎞️ 1920s Photo" },
        { "value": "ref:optionKeyName:Vintage Pulp Art", "text": "📖 Vintage Pulp" },
        { "value": "ref:optionKeyName:50s Infomercial Anime", "text": "📺 50s Info Anime" },
        { "value": "ref:optionKeyName:3D Pokemon", "text": "⚡ 3D Pokemon" },
        { "value": "ref:optionKeyName:Painted Pokemon", "text": "⚡ Painted Pokemon" },
        { "value": "ref:optionKeyName:2D Pokemon", "text": "⚡ 2D Pokemon" },
        { "value": "ref:optionKeyName:Vintage Anime", "text": "🎌 Vintage Anime" },
        { "value": "ref:optionKeyName:Neon Vintage Anime", "text": "🎌 Neon Vintage" },
        { "value": "ref:optionKeyName:Manga", "text": "📖 Manga Book" },
        { "value": "ref:optionKeyName:Fantasy World Map", "text": "🗺️ Fantasy World Map" },
        { "value": "ref:optionKeyName:Fantasy City Map", "text": "🗺️ Fantasy City Map" },
        { "value": "ref:optionKeyName:Old World Map", "text": "🗺️ Old World Map" },
        { "value": "ref:optionKeyName:3D Isometric Icon", "text": "🕹️ Isometric Icon" },
        { "value": "ref:optionKeyName:Flat Style Icon", "text": "🕹️ Flat Icon" },
        { "value": "ref:optionKeyName:Flat Style Logo", "text": "🎨 Flat Logo" },
        { "value": "ref:optionKeyName:Game Art Icon", "text": "🕹️ Game Art Icon" },
        { "value": "ref:optionKeyName:Digital Painting Icon", "text": "🕹️ Digital Icon" },
        { "value": "ref:optionKeyName:Concept Art Icon", "text": "🕹️ Concept Icon" },
        { "value": "ref:optionKeyName:Cute 3D Icon", "text": "🕹️ Cute 3D Icon" },
        { "value": "ref:optionKeyName:Cute 3D Icon 𝗦𝗲𝘁", "text": "🕹️ Cute 3D Set" },
        { "value": "ref:optionKeyName:Crayon Drawing", "text": "🖍️ Crayon Drawing" },
        { "value": "ref:optionKeyName:Pencil", "text": "✏️ Pencil Sketch" },
        { "value": "ref:optionKeyName:Tattoo Design", "text": "💀 Tattoo Design" },
        { "value": "ref:optionKeyName:Waifu", "text": "🎀 Waifu Portrait" },
        { "value": "ref:optionKeyName:YuGiOh Art", "text": "🃏 YuGiOh Art" },
        { "value": "ref:optionKeyName:Traditional Japanese", "text": "🏯 Traditional Japanese" },
        { "value": "ref:optionKeyName:Nihonga Painting", "text": "🏯 Nihonga Painting" },
        { "value": "ref:optionKeyName:Claymation", "text": "🧱 Claymation" },
        { "value": "ref:optionKeyName:Furry - Painted", "text": "🦊 Furry Painted" },
        { "value": "ref:optionKeyName:Furry - Drawn", "text": "🦊 Furry Drawn" },
        { "value": "ref:optionKeyName:Furry - Cinematic", "text": "🦊 Furry Cinematic" },
        { "value": "ref:optionKeyName:Cartoon", "text": "🎈 Cartoon Art" },
        { "value": "ref:optionKeyName:Cursed Photo", "text": "👁️ Cursed Photo" },
        { "value": "ref:optionKeyName:Developed by 9gin", "text": "🌐 Developed by 9gin" },
        { "value": "ref:optionKeyName:MTG Card", "text": "🃏 MTG Card" },
        { "value": "ref:optionKeyName:Jester", "text": "🃏 Jester Mode" },
        { "value": "ref:optionKeyName:Ninja", "text": "⚔️ Ninja Style" },
        { "value": "ref:optionKeyName:Random Girl 1", "text": "👩 Random Girl 1" },
        { "value": "ref:optionKeyName:Random Girl 2", "text": "👩 Random Girl 2" },
        { "value": "ref:optionKeyName:Lego", "text": "🧱 Lego Blocks" },
        { "value": "ref:optionKeyName:Skittles", "text": "🌈 Skittles Colors" },
        { "value": "ref:optionKeyName:Webcore", "text": "💻 Webcore Space" },
        { "value": "ref:optionKeyName:Terraria", "text": "⛏️ Terraria RPG" },
        { "value": "ref:optionKeyName:Final Fantasy", "text": "⚔️ Final Fantasy" },
        { "value": "ref:optionKeyName:Star Wars Character", "text": "🌌 Star Wars Figure" },
        { "value": "ref:optionKeyName:Star Wars Battle", "text": "🌌 Star Wars Battle" },
        { "value": "ref:optionKeyName:Dragonball", "text": "🐉 Dragonball Super" },
        { "value": "ref:optionKeyName:Undertale?", "text": "💀 Undertale World" },
        { "value": "ref:optionKeyName:ENA", "text": "🎮 ENA Geometric" },
        { "value": "ref:optionKeyName:Neko (Catgirl)", "text": "🐱 Neko Catgirl" },
        { "value": "ref:optionKeyName:American Girl", "text": "👩 American Girl" },
        { "value": "ref:optionKeyName:𝐍𝐒𝐅𝐖 - 𝐑𝐞𝐚𝐥𝐢𝐬𝐭𝐢𝐜", "text": "🔞 NSFW Realistic" },
        { "value": "ref:optionKeyName:𝐍𝐒𝐅𝐖 - 𝐀𝐧𝐢𝐦𝐞", "text": "🔞 NSFW Anime" },
        { "value": "ref:optionKeyName:𝐍𝐒𝐅𝐖 - 𝐑𝐞𝐚𝐥𝐢𝐬𝐭𝐢𝐜 (Stronger)", "text": "🔞 NSFW Realistic (Hardcore)" },
        { "value": "ref:optionKeyName:𝐍𝐒𝐅𝐖 - 𝐀𝐧𝐢𝐦𝐞 (Stronger)", "text": "🔞 NSFW Anime (Hardcore)" },
        { "value": "ref:optionKeyName:NSFW Painted Anime", "text": "🔞 NSFW Painted Anime" },
        { "value": "ref:optionKeyName:Realistic Human Generator", "text": "👩 Realistic Portrait 2.0" }
    ];

    // Populate Art Themes Selector
    const styleSelector = document.getElementById("styleSelector");
    const styleSelectorLanding = document.getElementById("styleSelectorLanding");
    if (styleSelector) {
        styleSelector.innerHTML = "";
        if (styleSelectorLanding) styleSelectorLanding.innerHTML = "";
        perchanceStyles.forEach(sty => {
            const opt = document.createElement("option");
            opt.value = sty.value;
            opt.textContent = sty.text;
            styleSelector.appendChild(opt);

            if (styleSelectorLanding) {
                const optLanding = document.createElement("option");
                optLanding.value = sty.value;
                optLanding.textContent = sty.text;
                styleSelectorLanding.appendChild(optLanding);
            }
        });
    }

    // Populate Mixing Styles Selector
    const styleMixSelector = document.getElementById("styleMixSelector");
    const styleMixSelectorLanding = document.getElementById("styleMixSelectorLanding");
    if (styleMixSelector) {
        styleMixSelector.innerHTML = "";
        if (styleMixSelectorLanding) styleMixSelectorLanding.innerHTML = "";
        const mixingStyles = [
            { "value": "ref:optionKeyName:Not Mix", "text": "🚫 Not Mix" },
            { "value": "ref:optionKeyName:NSFW", "text": "🌶️ NSFW Mixing" },
            ...perchanceStyles.filter(sty => sty.value !== "ref:optionKeyName:NSFW")
        ];

        mixingStyles.forEach(sty => {
            const opt = document.createElement("option");
            opt.value = sty.value;
            opt.textContent = sty.text;
            if (sty.value === "ref:optionKeyName:Not Mix") {
                opt.selected = true;
            }
            styleMixSelector.appendChild(opt);

            if (styleMixSelectorLanding) {
                const optLanding = document.createElement("option");
                optLanding.value = sty.value;
                optLanding.textContent = sty.text;
                if (sty.value === "ref:optionKeyName:Not Mix") {
                    optLanding.selected = true;
                }
                styleMixSelectorLanding.appendChild(optLanding);
            }
        });
    }

    // Dom Lookups — Views and Navigation
    const viewLanding = document.getElementById("viewLanding");
    const viewGeneration = document.getElementById("viewGeneration");
    const backToGeneratorBtn = document.getElementById("backToGeneratorBtn");

    // Form inputs — Landing view
    const landingForm = document.getElementById("landingForm");
    const promptInputLanding = document.getElementById("promptInputLanding");
    const toggleLandingSettingsBtn = document.getElementById("toggleLandingSettingsBtn");
    const toggleLandingHistoryBtn = document.getElementById("toggleLandingHistoryBtn");
    const landingSettingsPanel = document.getElementById("landingSettingsPanel");
    
    const ratioSelectorLanding = document.getElementById("ratioSelectorLanding");
    const numImagesSelectorLanding = document.getElementById("numImagesSelectorLanding");
    const guidanceSliderLanding = document.getElementById("guidanceSliderLanding");
    const guidanceValueLanding = document.getElementById("guidanceValueLanding");
    const seedInputLanding = document.getElementById("seedInputLanding");
    const negativePromptInputLanding = document.getElementById("negativePromptInputLanding");

    // Form inputs — Sidebar Workspace view
    const generatorForm = document.getElementById("generatorForm");
    const promptInput = document.getElementById("promptInput");
    const negativePromptInput = document.getElementById("negativePromptInput");
    const ratioSelector = document.getElementById("ratioSelector");
    const guidanceSlider = document.getElementById("guidanceSlider");
    const guidanceValue = document.getElementById("guidanceValue");
    const seedInput = document.getElementById("seedInput");
    const numImagesSelector = document.getElementById("numImagesSelector");

    // Viewport card states
    const stateLoading = document.getElementById("stateLoading");
    const stateResult = document.getElementById("stateResult");
    const viewportGridCanvas = document.getElementById("viewportGridCanvas");

    // Progress Loading Bar items
    const loadingProgressBar = document.getElementById("loadingProgressBar");
    const loadingProgressPercent = document.getElementById("loadingProgressPercent");
    const loadingProgressStep = document.getElementById("loadingProgressStep");

    // History panels
    const galleryGrid = document.getElementById("galleryGrid");
    const galleryEmpty = document.getElementById("galleryEmpty");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");

    // Fullscreen non-cropping Modal elements
    const fullscreenModal = document.getElementById("fullscreenModal");
    const modalImage = document.getElementById("modalImage");
    const modalPrompt = document.getElementById("modalPrompt");
    const modalMetaRatio = document.getElementById("modalMetaRatio");
    const modalMetaStyle = document.getElementById("modalMetaStyle");
    const modalMetaSeed = document.getElementById("modalMetaSeed");
    const modalActionDownload = document.getElementById("modalActionDownload");
    const modalActionReuse = document.getElementById("modalActionReuse");
    const modalCloseBtn = document.getElementById("modalCloseBtn");
    const modalBackdrop = document.getElementById("modalBackdrop");

    // Carousel chevrons controls
    const carouselPrevBtn = document.getElementById("carouselPrevBtn");
    const carouselNextBtn = document.getElementById("carouselNextBtn");
    const carouselIndicators = document.getElementById("carouselIndicators");

    // Reconnection UI elements
    const reconnectToast = document.getElementById("reconnectToast");
    const reconnectMessage = document.getElementById("reconnectMessage");

    // Core States
    let history = [];
    let currentSlide = 0;
    let totalSlides = 0;
    let receivedImagesCount = 0;
    let currentPayload = null;
    let retryCount = 0;
    const maxRetries = 4;

    // Mobile SPA Tab Navigation logic
    const navTabs = document.querySelectorAll(".nav-tab");
    const mobileDeck = document.getElementById("mobileTabDeck");
    const mobileCanvas = document.getElementById("mobileTabCanvas");
    
    // Initialize default tab on mobile
    if (mobileDeck) mobileDeck.classList.add("tab-active");

    function switchMobileTab(targetId) {
        if (targetId === "mobileTabGallery") {
            // Gallery lives on the landing page, so exit workspace and scroll to it
            switchView("landing");
            setTimeout(() => {
                document.querySelector(".gallery-container").scrollIntoView({ behavior: "smooth" });
            }, 500);
            return;
        }

        // Handle standard workspace tabs
        navTabs.forEach(t => t.classList.remove("active"));
        const btn = document.querySelector(`.nav-tab[data-target="${targetId}"]`);
        if (btn) btn.classList.add("active");

        if (mobileDeck) mobileDeck.classList.remove("tab-active");
        if (mobileCanvas) mobileCanvas.classList.remove("tab-active");

        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.classList.add("tab-active");
    }

    navTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            switchMobileTab(tab.getAttribute("data-target"));
        });
    });

    // Initialize history gallery loads (Moved to the bottom to avoid early reference errors)

    // Event: Toggle Landing/Home Settings view
    if (toggleLandingSettingsBtn && landingSettingsPanel) {
        toggleLandingSettingsBtn.addEventListener("click", () => {
            landingSettingsPanel.classList.toggle("active");
            toggleLandingSettingsBtn.classList.toggle("active");
        });
    }

    // Event: Toggle Landing/Home History panel
    if (toggleLandingHistoryBtn) {
        const landingDashboardLayout = document.querySelector(".landing-dashboard-layout");
        
        toggleLandingHistoryBtn.addEventListener("click", () => {
            const isCollapsed = landingDashboardLayout.classList.toggle("history-collapsed");
            toggleLandingHistoryBtn.classList.toggle("active", !isCollapsed);
            
            // Save state preference
            localStorage.setItem("parrot_history_collapsed", isCollapsed ? "true" : "false");
        });
        
        // Restore saved preference on startup
        const savedCollapsed = localStorage.getItem("parrot_history_collapsed");
        if (savedCollapsed === "true") {
            if (landingDashboardLayout) {
                landingDashboardLayout.classList.add("history-collapsed");
            }
            toggleLandingHistoryBtn.classList.remove("active");
        } else {
            if (landingDashboardLayout) {
                landingDashboardLayout.classList.remove("history-collapsed");
            }
            toggleLandingHistoryBtn.classList.add("active");
        }
    }

    // Event: Toggle collapsing parameters sidebar on Generation Page
    const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
    const workspaceSplit = document.querySelector(".workspace-split");
    if (toggleSidebarBtn && workspaceSplit) {
        toggleSidebarBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            workspaceSplit.classList.toggle("sidebar-collapsed");
        });
    }

    // Event: Back arrow click to return to home
    backToGeneratorBtn.addEventListener("click", () => {
        switchView("landing");
    });

    // Event: Realtime Guidance scale value label (Home / Landing)
    if (guidanceSliderLanding && guidanceValueLanding) {
        guidanceSliderLanding.addEventListener("input", (e) => {
            guidanceValueLanding.textContent = e.target.value;
            if (guidanceSlider) guidanceSlider.value = e.target.value;
            if (guidanceValue) guidanceValue.textContent = e.target.value;
        });
    }

    // Event: Realtime Guidance scale value label (Sidebar)
    if (guidanceSlider && guidanceValue) {
        guidanceSlider.addEventListener("input", (e) => {
            guidanceValue.textContent = e.target.value;
            if (guidanceSliderLanding) guidanceSliderLanding.value = e.target.value;
            if (guidanceValueLanding) guidanceValueLanding.textContent = e.target.value;
        });
    }

    // Bidirectional sync for other input dropdowns
    function registerSync(el1, el2, eventName = "change") {
        if (!el1 || !el2) return;
        el1.addEventListener(eventName, () => { el2.value = el1.value; });
        el2.addEventListener(eventName, () => { el1.value = el2.value; });
    }

    registerSync(styleSelectorLanding, styleSelector);
    registerSync(styleMixSelectorLanding, styleMixSelector);
    registerSync(ratioSelectorLanding, ratioSelector);
    registerSync(numImagesSelectorLanding, numImagesSelector);
    registerSync(seedInputLanding, seedInput, "input");
    registerSync(negativePromptInputLanding, negativePromptInput, "input");

    // Helper: trigger submit on pressing Enter (without Shift) inside prompt textareas
    function setupEnterSubmit(textarea, form) {
        textarea.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                form.requestSubmit();
            }
        });
    }
    setupEnterSubmit(promptInputLanding, landingForm);
    setupEnterSubmit(promptInput, generatorForm);

    // Submission Handler: Home landing form submission copies inputs to workspace form and triggers it!
    landingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const prompt = promptInputLanding.value.trim();
        if (!prompt) return;

        // Synchronize values to the split sidebar form controls
        promptInput.value = prompt;

        // Trigger programmatical submission on sidebar generator form!
        generatorForm.dispatchEvent(new Event("submit"));
    });

    // Submission Handler: Active Workspace generation triggers stream rendering
    generatorForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const prompt = promptInput.value.trim();
        if (!prompt) return;

        const numImages = parseInt(numImagesSelector.value) || 1;

        // Collect Payload
        currentPayload = {
            prompt: prompt,
            negative_prompt: negativePromptInput.value.trim(),
            style: styleSelector.value,
            style_mix: styleMixSelector ? styleMixSelector.value : "ref:optionKeyName:Not Mix",
            aspect_ratio: ratioSelector.value,
            guidance_scale: parseInt(guidanceSlider.value),
            seed: seedInput.value.trim(),
            num_images: numImages
        };

        // Reset indicators
        receivedImagesCount = 0;
        retryCount = 0;
        hideReconnectToast();

        // Reset progress loading bar elements
        if (loadingProgressBar) loadingProgressBar.style.width = "0%";
        if (loadingProgressPercent) loadingProgressPercent.textContent = "0%";
        if (loadingProgressStep) loadingProgressStep.textContent = "Connecting to PARROT.ai core...";

        // Configure viewport skeleton grids & switch views
        setupViewportGridSkeletons(numImages);
        showViewportState("loading");
        switchView("viewport");
        
        // Auto-switch mobile tab to Canvas to show loader immediately
        switchMobileTab("mobileTabCanvas");

        // Fire self-healing connection stream
        runGenerationStream();
    });

    // Self-healing Reconnection stream connection executor
    async function runGenerationStream() {
        const numImages = currentPayload.num_images;

        try {
            const response = await fetch("/api/generate/stream", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(currentPayload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Sandbox stream bridge handshake failed.");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";
            let currentEvent = null;

            // Handshake stage
            updateLoadingBar(20, "Securing creation tunnel...");

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                
                buffer = lines.pop(); // Trail trailing line chunk

                for (let line of lines) {
                    line = line.trim();
                    if (!line) continue;

                    if (line.startsWith("event: ")) {
                        currentEvent = line.substring(7).trim();
                    } else if (line.startsWith("data: ")) {
                        if (currentEvent) {
                            try {
                                const rawJson = line.substring(6).trim();
                                const parsedData = JSON.parse(rawJson);
                                handleSSEEvent(currentEvent, parsedData, currentPayload);
                            } catch (e) {
                                console.error("Error reading streaming parsing:", e, line);
                            }
                            currentEvent = null;
                        }
                    }
                }
            }

            hideReconnectToast();

        } catch (error) {
            console.warn("Generation stream bridge interrupted:", error);
            
            // Retry handler
            if (receivedImagesCount < numImages && retryCount < maxRetries) {
                retryCount++;
                showReconnectToast(`Connection fluctuation. Auto-resuming and synching (Attempt ${retryCount}/${maxRetries})...`);
                
                setTimeout(() => {
                    runGenerationStream();
                }, 2000);
            } else {
                hideReconnectToast();
                alert("PARROT.ai Synthesizer Engine is currently offline. Please retry in a moment.");
                switchView("landing");
            }
        }
    }

    // Update loading bar progress percentage helper
    function updateLoadingBar(percent, stepText) {
        if (loadingProgressBar) loadingProgressBar.style.width = percent + "%";
        if (loadingProgressPercent) loadingProgressPercent.textContent = percent + "%";
        if (loadingProgressStep) loadingProgressStep.textContent = stepText;
    }

    // Decodes individual SSE Events
    function handleSSEEvent(event, data, payload) {
        if (event === "stage") {
            const step = data.step;
            const message = data.message || data.text || "";
            
            if (step === 1) {
                updateLoadingBar(10, message || "Acquiring generation lock slot...");
            } else if (step === 2) {
                updateLoadingBar(35, message || "Navigating sandbox session...");
            } else if (step === 3) {
                updateLoadingBar(60, message || "Injecting prompt parameters...");
            } else if (step === 4) {
                updateLoadingBar(85, message || "Awaiting neural renderings...");
                // On step 4, the renderer begins drawing! Switch viewport state to show active carousel skeletons.
                // Wait slightly to let the loading bar reach 85% with premium transitions
                setTimeout(() => {
                    showViewportState("result");
                }, 600);
            }
        } 
        else if (event === "image") {
            const index = data.index;
            const b64 = "data:image/png;base64," + data.b64;
            
            receivedImagesCount++;

            updateGridCardWithImage(index, b64, payload);

            // Auto-scroll track to the newly generated image!
            const newCard = document.getElementById("grid-card-" + index);
            if (newCard && viewportGridCanvas) {
                viewportGridCanvas.scrollTo({
                    left: newCard.offsetLeft - 24,
                    behavior: 'smooth'
                });
            }

            // Dynamically push progress to 100% as batch is fully completed
            const totalToExpect = payload.num_images || 1;
            const progressPortion = 85 + Math.floor((receivedImagesCount / totalToExpect) * 15);
            updateLoadingBar(Math.min(progressPortion, 100), `Synthesized image ${receivedImagesCount} of ${totalToExpect}...`);
        }
        else if (event === "complete") {
            console.log("Synthesizer batch complete:", data.count);
            updateLoadingBar(100, "Creation complete!");
            hideReconnectToast();
        }
        else if (event === "error") {
            alert("Model Backend Warning: " + data);
            switchView("landing");
        }
    }

    // Build dynamic auto-sizing grid skeletons directly into the track
    function setupViewportGridSkeletons(count) {
        viewportGridCanvas.innerHTML = "";
        
        // Determine aspect ratio styles from currentPayload
        let aspectStyle = "2/3"; // default Portrait
        const ratioVal = currentPayload.aspect_ratio || "512x768";
        if (ratioVal.includes("512x512") || ratioVal === "1:1") {
            aspectStyle = "1/1";
        } else if (ratioVal.includes("768x512") || ratioVal === "3:2") {
            aspectStyle = "3/2";
        } else if (ratioVal.includes("512x768") || ratioVal === "2:3") {
            aspectStyle = "2/3";
        }

        // Add all skeletons directly to the horizontal snap track
        for (let i = 0; i < count; i++) {
            const card = document.createElement("div");
            card.className = "grid-image-card skeleton";
            card.id = "grid-card-" + i;
            card.style.setProperty("--aspect-ratio", aspectStyle);
            card.setAttribute("data-aspect", aspectStyle);
            card.innerHTML = `
                <div class="skeleton-spinner">
                    <i class="fa-solid fa-circle-notch fa-spin"></i>
                    <span>SYNTHESIZING ${i+1}/${count}...</span>
                </div>
            `;
            viewportGridCanvas.appendChild(card);
        }
        
        // Reset scroll position to start
        viewportGridCanvas.scrollTo({ left: 0, behavior: 'auto' });
    }

    // Fill image data and bind trigger listeners to cards
    function updateGridCardWithImage(index, base64Url, payload) {
        const card = document.getElementById("grid-card-" + index);
        if (!card) return;

        card.classList.remove("skeleton");
        card.innerHTML = `
            <img src="${base64Url}" alt="Artwork">
            <div class="image-toolbar">
                <button class="grid-action-download" title="Download Artwork"><i class="fa-solid fa-download"></i></button>
                <button class="grid-action-fullscreen" title="Fullscreen High-Res"><i class="fa-solid fa-expand"></i></button>
                <button class="grid-action-copy" title="Copy Base64 Data"><i class="fa-solid fa-copy"></i></button>
                <button class="grid-action-favorite" title="Saved to Local Storage" style="color: var(--primary)"><i class="fa-solid fa-bookmark"></i></button>
            </div>
        `;

        // Direct card click opens fullscreen modal (Request 5)
        card.addEventListener("click", () => {
            openModal({
                image: base64Url,
                prompt: payload.prompt,
                aspect_ratio: payload.aspect_ratio,
                style: styleSelector.options[styleSelector.selectedIndex].text,
                seed: payload.seed || "Auto (Random)"
            });
        });

        card.querySelector(".grid-action-download").addEventListener("click", (evt) => {
            evt.stopPropagation();
            downloadImage(base64Url, `parrot-ai-${index + 1}.png`);
        });

        card.querySelector(".grid-action-fullscreen").addEventListener("click", (evt) => {
            evt.stopPropagation();
            openModal({
                image: base64Url,
                prompt: payload.prompt,
                aspect_ratio: payload.aspect_ratio,
                style: styleSelector.options[styleSelector.selectedIndex].text,
                seed: payload.seed || "Auto (Random)"
            });
        });

        card.querySelector(".grid-action-copy").addEventListener("click", (evt) => {
            evt.stopPropagation();
            navigator.clipboard.writeText(base64Url)
                .then(() => alert("Copied base64 image data to clipboard!"))
                .catch(() => alert("Failed to copy."));
        });

        // Auto-save generated image parameter to history local storage list
        saveToHistory({
            id: uuidv4(),
            timestamp: Date.now(),
            image: base64Url,
            prompt: payload.prompt,
            negative_prompt: payload.negative_prompt,
            style: styleSelector.options[styleSelector.selectedIndex].text,
            aspect_ratio: payload.aspect_ratio,
            guidance_scale: payload.guidance_scale,
            seed: payload.seed || "Auto (Random)"
        });
    }

    // Page-view smooth slide fade switcher helper
    function switchView(target) {
        if (target === "landing") {
            viewGeneration.classList.remove("active");
            setTimeout(() => {
                viewGeneration.style.display = "none";
                viewLanding.style.display = "block";
                setTimeout(() => {
                    viewLanding.classList.add("active");
                }, 40);
            }, 400);
        } else if (target === "viewport") {
            viewLanding.classList.remove("active");
            setTimeout(() => {
                viewLanding.style.display = "none";
                viewGeneration.style.display = "flex"; // Split row layout is flex!
                setTimeout(() => {
                    viewGeneration.classList.add("active");
                }, 40);
            }, 400);
        }
    }

    // Toggle loader / active carousel
    function showViewportState(state) {
        stateLoading.classList.remove("active");
        stateResult.classList.remove("active");

        if (state === "loading") stateLoading.classList.add("active");
        if (state === "result") stateResult.classList.add("active");
    }

    // Reconnection toast elements controllers
    function showReconnectToast(msg) {
        reconnectMessage.textContent = msg;
        reconnectToast.classList.add("active");
    }

    function hideReconnectToast() {
        reconnectToast.classList.remove("active");
    }

    const NSFW_KEYWORDS = [
        "nude", "naked", "erotic", "sexy", "porn", "hentai", "bikini", "lingerie", 
        "cleavage", "undressed", "topless", "nsfw", "xxx", "lewd", "sensual", "busty"
    ];

    function isPromptNSFW(prompt, negativePrompt) {
        const text = ((prompt || "") + " " + (negativePrompt || "")).toLowerCase();
        return NSFW_KEYWORDS.some(kw => text.includes(kw));
    }

    // Local Storage History helper databases
    function loadHistory() {
        try {
            const stored = localStorage.getItem("parrot_history");
            history = stored ? JSON.parse(stored) : [];
        } catch (e) {
            history = [];
        }
        renderHistory();
    }

    function saveToHistory(item) {
        const exists = history.some(x => x.image === item.image);
        if (exists) return;

        // Tag NSFW content (Request 6)
        item.nsfw = isPromptNSFW(item.prompt, item.negative_prompt);

        history.unshift(item);
        if (history.length > 30) {
            history = history.slice(0, 30);
        }
        localStorage.setItem("parrot_history", JSON.stringify(history));
        renderHistory();
    }

    const galleryFilterToggle = document.getElementById("galleryFilterToggle");
    if (galleryFilterToggle) {
        galleryFilterToggle.addEventListener("change", () => {
            renderHistory();
        });
    }

    function getAspectRatioStyle(ratioStr) {
        if (!ratioStr) return "2/3";
        if (ratioStr.includes("512x512") || ratioStr === "1:1" || ratioStr === "1/1") return "1/1";
        if (ratioStr.includes("768x512") || ratioStr === "3:2" || ratioStr === "3/2") return "3/2";
        if (ratioStr.includes("512x768") || ratioStr === "2:3" || ratioStr === "2/3") return "2/3";
        return "2/3";
    }

    function renderHistory() {
        galleryGrid.innerHTML = "";
        
        const showSafeOnly = galleryFilterToggle ? galleryFilterToggle.checked : true;
        
        const filteredHistory = history.filter(item => {
            if (showSafeOnly && item.nsfw === true) {
                return false;
            }
            return true;
        });
        
        if (filteredHistory.length === 0) {
            galleryEmpty.style.display = "block";
            return;
        }
        
        galleryEmpty.style.display = "none";
        
        filteredHistory.forEach(item => {
            const card = document.createElement("div");
            card.className = "gallery-item";
            card.style.aspectRatio = getAspectRatioStyle(item.aspect_ratio);
            
            card.innerHTML = `
                <img src="${item.image}" alt="History item">
                <div class="gallery-item-info">
                    ${escapeHtml(item.prompt)}
                </div>
                <div class="image-toolbar">
                    <button class="gallery-action-download" title="Download Artwork"><i class="fa-solid fa-download"></i></button>
                    <button class="gallery-action-fullscreen" title="Fullscreen High-Res"><i class="fa-solid fa-expand"></i></button>
                    <button class="gallery-action-reuse" title="Reuse Parameters"><i class="fa-solid fa-repeat"></i></button>
                </div>
            `;
            
            // Direct card click opens fullscreen modal
            card.addEventListener("click", () => {
                openModal(item);
            });
            
            // Bind toolbars buttons specifically to prevent event bubbling
            card.querySelector(".gallery-action-download").addEventListener("click", (evt) => {
                evt.stopPropagation();
                downloadImage(item.image, "parrot-ai-saved.png");
            });

            card.querySelector(".gallery-action-fullscreen").addEventListener("click", (evt) => {
                evt.stopPropagation();
                openModal(item);
            });

            card.querySelector(".gallery-action-reuse").addEventListener("click", (evt) => {
                evt.stopPropagation();
                
                // Load Prompt and Negatives
                promptInputLanding.value = item.prompt;
                promptInput.value = item.prompt;
                
                negativePromptInputLanding.value = item.negative_prompt || "";
                negativePromptInput.value = item.negative_prompt || "";
                
                // Load Ratio
                ratioSelectorLanding.value = item.aspect_ratio || "512x768";
                ratioSelector.value = item.aspect_ratio || "512x768";
                
                // Load Guidance
                if (item.guidance_scale) {
                    guidanceSliderLanding.value = item.guidance_scale;
                    guidanceValueLanding.textContent = item.guidance_scale;
                    guidanceSlider.value = item.guidance_scale;
                    guidanceValue.textContent = item.guidance_scale;
                }
                
                // Load Seed
                if (item.seed && item.seed !== "Auto (Random)") {
                    seedInputLanding.value = item.seed;
                    seedInput.value = item.seed;
                } else {
                    seedInputLanding.value = "";
                    seedInput.value = "";
                }
                
                // Load Style & Mixing if text matches
                if (item.style) {
                    for (let i = 0; i < styleSelector.options.length; i++) {
                        if (styleSelector.options[i].text.includes(item.style) || item.style.includes(styleSelector.options[i].text)) {
                            styleSelector.selectedIndex = i;
                            styleSelectorLanding.selectedIndex = i;
                            break;
                        }
                    }
                }
                
                // Scroll settings card into view or open it if it's home
                if (landingSettingsPanel && !landingSettingsPanel.classList.contains("active")) {
                    landingSettingsPanel.classList.add("active");
                    if (toggleLandingSettingsBtn) toggleLandingSettingsBtn.classList.add("active");
                }
                
                alert("Loaded parameters back to generation deck!");
            });
            
            galleryGrid.appendChild(card);
        });
    }

    clearHistoryBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear your history?")) {
            localStorage.removeItem("parrot_history");
            history = [];
            renderHistory();
        }
    });

    // Fullscreen Non-Cropped Modal handlers
    function openModal(item) {
        modalImage.src = item.image;
        modalPrompt.textContent = item.prompt;
        modalPrompt.classList.remove("expanded");
        modalPrompt.style.maxHeight = "4.4em";
        
        const expandBtn = document.getElementById("modalPromptExpandBtn");
        if (expandBtn) {
            expandBtn.textContent = "Read more";
            if (item.prompt && item.prompt.length > 100) {
                expandBtn.style.display = "block";
            } else {
                expandBtn.style.display = "none";
                modalPrompt.style.maxHeight = "none";
            }
            expandBtn.onclick = (e) => {
                e.stopPropagation();
                if (modalPrompt.classList.contains("expanded")) {
                    modalPrompt.classList.remove("expanded");
                    modalPrompt.style.maxHeight = "4.4em";
                    expandBtn.textContent = "Read more";
                } else {
                    modalPrompt.classList.add("expanded");
                    modalPrompt.style.maxHeight = "400px";
                    expandBtn.textContent = "Show less";
                }
            };
        }

        modalMetaRatio.innerHTML = `<i class="fa-solid fa-crop-simple"></i> Canvas: ${item.aspect_ratio}`;
        modalMetaStyle.innerHTML = `<i class="fa-solid fa-palette"></i> Style: ${item.style}`;
        modalMetaSeed.innerHTML = `<i class="fa-solid fa-fingerprint"></i> Seed: ${item.seed}`;
        
        fullscreenModal.classList.add("active");

        modalActionDownload.onclick = () => {
            downloadImage(item.image, `parrot-ai-masterpiece.png`);
        };

        modalActionReuse.onclick = () => {
            promptInput.value = item.prompt;
            negativePromptInput.value = item.negative_prompt || "";
            ratioSelector.value = item.aspect_ratio || "512x512";
            
            if (item.style) {
                for (let i = 0; i < styleSelector.options.length; i++) {
                    if (styleSelector.options[i].text.includes(item.style) || item.style.includes(styleSelector.options[i].text)) {
                        styleSelector.selectedIndex = i;
                        break;
                    }
                }
            }
            if (item.guidance_scale) {
                guidanceSlider.value = item.guidance_scale;
                guidanceValue.textContent = item.guidance_scale;
            }
            if (item.seed && item.seed !== "Auto (Random)") seedInput.value = item.seed;
            
            closeModal();
            switchView("viewport");
            document.getElementById("generatorForm").scrollIntoView({ behavior: "smooth" });
        };
    }

    function closeModal() {
        fullscreenModal.classList.remove("active");
    }

    modalCloseBtn.addEventListener("click", closeModal);
    modalBackdrop.addEventListener("click", closeModal);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });

    // Triggers PNG download from browser
    function downloadImage(base64Str, filename) {
        const link = document.createElement("a");
        link.href = base64Str;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // uuidv4 generator
    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Escape HTML tags to protect against XSS
    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Enhance & default negative buttons event listeners
    const enhancePromptBtnLanding = document.getElementById("enhancePromptBtnLanding");
    const enhancePromptBtn = document.getElementById("enhancePromptBtn");
    const fillDefaultNegativeBtnLanding = document.getElementById("fillDefaultNegativeBtnLanding");
    const fillDefaultNegativeBtn = document.getElementById("fillDefaultNegativeBtn");

    if (enhancePromptBtnLanding) {
        enhancePromptBtnLanding.addEventListener("click", () => {
            appendSuffix(promptInputLanding, ENHANCE_SUFFIX);
        });
    }

    if (enhancePromptBtn) {
        enhancePromptBtn.addEventListener("click", () => {
            appendSuffix(promptInput, ENHANCE_SUFFIX);
        });
    }

    if (fillDefaultNegativeBtnLanding) {
        fillDefaultNegativeBtnLanding.addEventListener("click", () => {
            appendSuffix(negativePromptInputLanding, NEGATIVE_SUFFIX);
        });
    }

    if (fillDefaultNegativeBtn) {
        fillDefaultNegativeBtn.addEventListener("click", () => {
            appendSuffix(negativePromptInput, NEGATIVE_SUFFIX);
        });
    }

    // Startup Sync Loader
    const startupOverlay = document.getElementById("startupOverlay");
    const startupStatusText = document.getElementById("startupStatusText");
    
    async function checkBackendStatus() {
        if (!startupOverlay) return;
        try {
            const response = await fetch("/api/status");
            if (response.ok) {
                const data = await response.json();
                if (data.ready) {
                    startupOverlay.classList.remove("active");
                    setTimeout(() => {
                        startupOverlay.style.display = "none";
                    }, 500);
                } else {
                    if (data.error) {
                        startupStatusText.textContent = "Initialization Failed: " + data.error;
                        startupStatusText.style.color = "#f87171";
                    } else {
                        startupStatusText.textContent = "Syncing with background Perchance engine...";
                        setTimeout(checkBackendStatus, 1000);
                    }
                }
            } else {
                startupStatusText.textContent = "Re-establishing server connection...";
                setTimeout(checkBackendStatus, 1500);
            }
        } catch (e) {
            startupStatusText.textContent = "Establishing client handshake node...";
            setTimeout(checkBackendStatus, 1500);
        }
    }
    
    checkBackendStatus();

    // Safely trigger initial history loader after all elements are bound!
    loadHistory();
});
