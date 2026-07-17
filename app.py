import json
import os
import uuid
import time
import base64
import threading
import urllib.request
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import HTMLResponse, FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import socket

def is_internet_available() -> bool:
    try:
        socket.setdefaulttimeout(2)
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(("8.8.8.8", 53))
        s.close()
        return True
    except:
        return False

# 1. Apply Perchancy Monkeypatch BEFORE client initialization
import perchancy
from DrissionPage import ChromiumOptions

original_init_driver = perchancy.core.BrowserCore.init_driver

def custom_init_driver(self, proxy=None):
    if self.page is not None:
        try:
            self.page.quit()
        except:
            pass
        self.page = None
    
    print("[PROXY-PATCH] Initializing custom Chromium browser with auto_port...")
    options = ChromiumOptions()
    options.auto_port() # Allocate an available port automatically
    
    if self.headless:
        options.headless(True)
        options.set_argument("--headless=new")
        options.set_argument("--use-gl=angle")
        options.set_argument("--use-angle=swiftshader")
        options.set_argument("--enable-webgl")
        options.set_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
    else:
        options.headless(False)
        options.set_argument("--window-size=1024,768")
        options.set_argument("--window-position=-2000,-2000")
        
    options.set_argument("--disable-blink-features=AutomationControlled")
    options.set_pref('profile.default_content_setting_values.popups', 2)
    options.set_argument("--no-sandbox")
    options.set_argument("--disable-dev-shm-usage")
    options.set_argument("--mute-audio")
    
    # Disable background / occlusion throttling to prevent off-screen tab suspends
    options.set_argument("--disable-backgrounding-occluded-windows")
    options.set_argument("--disable-background-timer-throttling")
    options.set_argument("--disable-renderer-backgrounding")
    
    if proxy:
        options.set_proxy(proxy)

    self.page = perchancy.core.ChromiumPage(options)
    self.page.get("about:blank")
    
    if not self.headless:
        try:
            print("[PROXY-PATCH] Ensuring browser window is placed off-screen...")
            self.page.set.window.size(1024, 768)
            self.page.set.window.location(-2000, -2000)
        except Exception as e:
            print("[PROXY-PATCH] Could not size/move window:", e)
            
    print("[PROXY-PATCH] Browser initialized successfully.")

# Patch the library!
perchancy.core.BrowserCore.init_driver = custom_init_driver


# Global variables for perchancy Client and persistent page reference
client_instance = None

# Background browser pool initialization signaling
pool_initialized = threading.Event()
pool_error = None
tab_pool = []

def initialize_browser_client():
    global client_instance, tab_pool, pool_error
    try:
        print("[STARTUP-THREAD] Starting persistent Perchance headful client...")
        pool_initialized.clear()
        pool_error = None
        tab_pool = []
        
        client_instance = perchancy.Client(headless=False)
        print("[STARTUP-THREAD] Initializing core driver instance...")
        client_instance.core.init_driver()
        
        # Warm up exactly 1 tab on startup by navigating the primary page
        print("[STARTUP-THREAD] Warming up primary generator tab...")
        tab = client_instance.core.page
        tab.get("https://perchance.org/ufsykzlant")
        tab_pool.append({
            "id": 0,
            "tab": tab,
            "lock": threading.Lock(),
            "current_gen_id": None,
            "is_extra": False
        })
        print("[STARTUP-THREAD] Primary tab ready. Signaling server ready.")
        pool_initialized.set()
    except Exception as e:
        pool_error = str(e)
        print("[STARTUP-THREAD] Error initializing browser client pool:", e)

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client_instance
    print("[STARTUP] Spawning browser pool initialization thread...")
    thread = threading.Thread(target=initialize_browser_client, daemon=True)
    thread.start()
    
    yield  # Let the FastAPI app run
    
    if client_instance:
        print("[SHUTDOWN] Closing browser client...")
        try:
            client_instance.close()
            print("[SHUTDOWN] Closed.")
        except Exception as e:
            print("[SHUTDOWN] Error closing client:", e)

# 2. FastAPI Setup
app = FastAPI(
    title="Perchance Image Proxy", 
    description="API Proxy and Premium Web Interface for Perchance AI Image Generator",
    lifespan=lifespan
)


# 3. Active NSFW Bypass & Auto-Dismiss JavaScript
BYPASS_NSFW_JS = """
try {
    function setReactVal(el, val) {
        if (!el) return;
        let prototype = Object.getPrototypeOf(el);
        let nativeSetter = Object.getOwnPropertyDescriptor(prototype, "value");
        if (!nativeSetter && el.tagName === 'SELECT') {
            prototype = window.HTMLSelectElement.prototype;
            nativeSetter = Object.getOwnPropertyDescriptor(prototype, "value");
        }
        if (nativeSetter && nativeSetter.set) {
            nativeSetter.set.call(el, val);
        } else {
            el.value = val;
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function setReactChecked(el, checked) {
        if (!el) return;
        let prototype = Object.getPrototypeOf(el);
        let nativeSetter = Object.getOwnPropertyDescriptor(prototype, "checked");
        if (!nativeSetter) {
            prototype = window.HTMLInputElement.prototype;
            nativeSetter = Object.getOwnPropertyDescriptor(prototype, "checked");
        }
        if (nativeSetter && nativeSetter.set) {
            nativeSetter.set.call(el, checked);
        } else {
            el.checked = checked;
        }
        el.dispatchEvent(new Event('click', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // 1. Detect standard safety blocked text and click change settings / warning button
    let contentGuard = document.querySelector('#contentGuardEl, [class*="contentGuard"], .nsfw-warning');
    if (contentGuard && (contentGuard.offsetWidth > 0 || contentGuard.getBoundingClientRect().width > 0)) {
        let btn = contentGuard.querySelector('button, .button, [role="button"]');
        if (btn) {
            btn.click();
            console.log("BYPASS: Clicked change settings / warning button");
        }
    }
    
    // 2. Locate Settings modal container and check 18+ boxes (in case it opened)
    let selects = document.querySelectorAll('select');
    for (let sel of selects) {
        if (sel.innerText.toLowerCase().includes('pg-13') || sel.innerText.toLowerCase().includes('disable filter')) {
            if (sel.value !== 'disable filter permanently' && sel.value !== 'ref:optionKeyName:Disable filter permanently') {
                for (let i = 0; i < sel.options.length; i++) {
                    let optText = sel.options[i].text.toLowerCase();
                    if (optText.includes('permanently')) {
                        setReactVal(sel, sel.options[i].value);
                        console.log("BYPASS: Selected disable filter permanently");
                        break;
                    }
                }
            }
        }
    }
    
    // 3. Find check box for over 18 years old
    let checkboxes = document.querySelectorAll('input[type="checkbox"]');
    for (let cb of checkboxes) {
        let labelText = '';
        if (cb.parentNode) labelText = cb.parentNode.innerText.toLowerCase();
        if (labelText.includes('18') || labelText.includes('over') || labelText.includes('adult') || labelText.includes('old') || labelText.includes('age')) {
            if (!cb.checked) {
                setReactChecked(cb, true);
                console.log("BYPASS: Checked over 18 checkbox");
            }
        }
    }
    
    // 4. Click Save button on the warning
    let btns = document.querySelectorAll('button, .button, [role="button"], input[type="button"]');
    for (let b of btns) {
        let t = (b.innerText || b.value || '').toLowerCase();
        if (t === 'save' || t.includes('confirm') || t.includes('agree')) {
            b.click();
            console.log("BYPASS: Clicked Save/Confirm/Agree button");
        }
    }
    
} catch(e) {}
"""



def save_image_locally(base64_data: str, prompt: str, index: int):
    try:
        import re
        from datetime import datetime
        
        # Ensure 'gens' directory exists
        gens_dir = os.path.join(os.path.dirname(__file__), "gens")
        if not os.path.exists(gens_dir):
            os.makedirs(gens_dir)
            
        # Sanitize prompt for filename (remove unsafe characters, limit length)
        sanitized_prompt = re.sub(r'[^a-zA-Z0-9_\-]', '_', prompt)[:50].strip('_')
        if not sanitized_prompt:
            sanitized_prompt = "generated"
            
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_idx{index}_{sanitized_prompt}.png"
        filepath = os.path.join(gens_dir, filename)
        
        # Decode base64 data and write bytes to PNG
        image_bytes = base64.b64decode(base64_data)
        with open(filepath, "wb") as f:
            f.write(image_bytes)
            
        print(f"[LOCAL-SAVE] Saved image to {filepath}")
    except Exception as e:
        print("[LOCAL-SAVE] Error saving image:", e)


# 4. API Schemas & SSE Endpoints
class GenerateRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = ""
    aspect_ratio: Optional[str] = "512x768" # 512x512, 512x768, 768x512
    style: Optional[str] = "ref:optionKeyName:Painted Anime Plus"
    style_mix: Optional[str] = "ref:optionKeyName:Not Mix"
    guidance_scale: Optional[int] = 7
    seed: Optional[str] = ""
    num_images: Optional[int] = 1

def sse_pack(event: str, data: Any) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"

@app.post("/api/generate/stream")
def generate_image_stream(payload: GenerateRequest):
    global client_instance, tab_pool
    
    # Wait for the browser pool thread to finish initialization (up to 45 seconds)
    if not pool_initialized.is_set():
        if pool_error:
            raise HTTPException(status_code=500, detail=f"Browser pool initialization failed: {pool_error}")
        print("[API] Browser pool is not ready yet. Waiting for warmup...")
        ready = pool_initialized.wait(timeout=45.0)
        if not ready:
            if pool_error:
                raise HTTPException(status_code=500, detail=f"Browser pool initialization failed: {pool_error}")
            raise HTTPException(status_code=503, detail="Browser pool is still warming up. Please wait a few seconds and try again.")
            
    if not client_instance or not tab_pool:
        raise HTTPException(status_code=500, detail="Browser pool is not warmed up.")

    # Target Selector Maps
    prompt_selector = "textarea.paragraph-input:not([placeholder*='store']):not([placeholder*='dont want']), textarea[placeholder*='You can use this text box'], textarea.paragraph-input"
    negative_selector = "textarea.paragraph-input[placeholder*='dont want'], textarea[placeholder*='dont want']"
    button_selector = "#generateButtonEl"
    output_selectors = ["img", "canvas"]

    # Search for an available tab or queue up to 60 seconds
    allocated_tab_info = None
    wait_start = time.time()
    while time.time() - wait_start < 60.0:
        # Check if the main tab (id == 0) is available and try to acquire it
        for item in tab_pool:
            if item.get("id") == 0:
                if item["lock"].acquire(blocking=False):
                    allocated_tab_info = item
                    break
        if allocated_tab_info:
            break
            
        # If the main tab is busy, spawn another tab on demand (up to 5 concurrent tabs total)
        if len(tab_pool) < 5:
            try:
                new_id = int(time.time() * 1000) # Unique temp ID
                print(f"[DYNAMIC-SPAWN] Main tab busy. Spawning temporary extra tab (ID: {new_id})...")
                new_tab = client_instance.core.page.new_tab("https://perchance.org/ufsykzlant")
                time.sleep(2)
                item = {
                    "id": new_id,
                    "tab": new_tab,
                    "lock": threading.Lock(),
                    "current_gen_id": None,
                    "is_extra": True
                }
                item["lock"].acquire()
                tab_pool.append(item)
                allocated_tab_info = item
                break
            except Exception as e:
                print(f"[DYNAMIC-SPAWN] Error spawning extra tab: {e}")
                
        time.sleep(0.5)
        
    if not allocated_tab_info:
        raise HTTPException(status_code=503, detail="All generation slots are currently busy. Please try again in a few moments.")

    def event_generator():
        import uuid
        this_gen_id = str(uuid.uuid4())
        allocated_tab_info["current_gen_id"] = this_gen_id
        
        # Track active tab context
        active_tab = allocated_tab_info["tab"]
        try:
            # Stage 1: Slot Acquired
            yield sse_pack("stage", {"step": 1, "text": f"Slot acquired on session tab {allocated_tab_info['id'] + 1}..."})
            
            # Stage 2: Preparing and navigating
            yield sse_pack("stage", {"step": 2, "text": "Securing sandbox connection node..."})
            
            # Internet connectivity auto-recovery check before proceeding
            if not is_internet_available():
                yield sse_pack("stage", {"step": 2, "text": "Internet connection lost. Waiting for recovery..."})
                print("[SSE] Internet is down. Entering recovery wait loop...")
                recovery_start = time.time()
                while not is_internet_available():
                    if time.time() - recovery_start > 60.0:
                        yield sse_pack("error", "Internet connection could not be restored within 60s.")
                        return
                    time.sleep(2)
                yield sse_pack("stage", {"step": 2, "text": "Internet restored! Re-initializing tab context..."})
                print("[SSE] Internet connection restored. Recovering tab...")
                try:
                    active_tab.get("https://perchance.org/ufsykzlant")
                except:
                    pass
                time.sleep(5)
            
            # Check tab frame
            generator_frame = None
            js_check = """
            try {
                let hasIn = document.querySelector('textarea.paragraph-input') !== null || document.querySelector('textarea[data-name="description"]') !== null;
                let hasBtn = document.getElementById('generateButtonEl') !== null || document.querySelector('[data-name="generateButton"]') !== null || document.querySelector('button[id*="generate" i]') !== null;
                return hasIn && hasBtn;
            } catch(e) { return false; }
            """
            for f in client_instance.core._get_all_frames(active_tab):
                try:
                    if f.run_js(js_check):
                        generator_frame = f
                        break
                except:
                    pass
                    
            if not generator_frame:
                # Reload or refresh tab as fail-safe
                tab_label = f"extra tab {allocated_tab_info['id']}" if allocated_tab_info.get("is_extra") else "main tab"
                print(f"[SSE] Generator frame lost or page disconnected on {tab_label}. Attempting recovery...")
                try:
                    if not allocated_tab_info.get("is_extra"):
                        active_tab = client_instance.core.page
                        active_tab.get("https://perchance.org/ufsykzlant")
                    else:
                        active_tab = client_instance.core.page.new_tab("https://perchance.org/ufsykzlant")
                    allocated_tab_info["tab"] = active_tab
                except Exception as tab_ex:
                    print("[SSE] Browser session fully lost. Re-initializing core driver page...", tab_ex)
                    client_instance.core.init_driver()
                    if not allocated_tab_info.get("is_extra"):
                        active_tab = client_instance.core.page
                        active_tab.get("https://perchance.org/ufsykzlant")
                    else:
                        active_tab = client_instance.core.page.new_tab("https://perchance.org/ufsykzlant")
                    allocated_tab_info["tab"] = active_tab
                
                time.sleep(6)
                for f in client_instance.core._get_all_frames(active_tab):
                    try:
                        if f.run_js(js_check):
                            generator_frame = f
                            break
                    except:
                        pass
                        
            if not generator_frame:
                yield sse_pack("error", "Failed to locate core generator canvas iframe.")
                return

            # Apply Content Safety settings dynamically beforehand on all frames
            for f in client_instance.core._get_all_frames(active_tab):
                try:
                    f.run_js(BYPASS_NSFW_JS)
                except:
                    pass

            # Stage 3: Injecting Prompts and Selectors
            yield sse_pack("stage", {"step": 3, "text": "Injecting multi-prompt styles..."})

            js_stop_gen = """
            try {
                let btn = document.getElementById('generateButtonEl');
                if (btn && (btn.innerText.toLowerCase().includes('stop') || btn.innerText.toLowerCase().includes('cancel'))) {
                    btn.focus();
                    btn.click();
                    ['mousedown', 'mouseup', 'click'].forEach(evt => {
                        btn.dispatchEvent(new MouseEvent(evt, {bubbles: true, cancelable: true, view: window}));
                    });
                    return "stopped";
                }
                return "ready";
            } catch(e) { return "error"; }
            """
            btn_state = generator_frame.run_js(js_stop_gen)
            if btn_state == "stopped":
                print("[SSE] Stopping existing active generator run...")
                time.sleep(1.5)
            
            # Fill main prompt, negative prompt, style selectors, ratio, guidance and seed using native React setters
            js_fill_everything = f"""
            try {{
                function setReactValue(el, value) {{
                    if (!el) return;
                    el.focus();
                    let nativeSetter = null;
                    let tag = el.tagName.toLowerCase();
                    if (tag === 'textarea') {{
                        nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value");
                    }} else if (tag === 'input') {{
                        nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
                    }} else if (tag === 'select') {{
                        nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value");
                    }}
                    
                    if (nativeSetter && nativeSetter.set) {{
                        nativeSetter.set.call(el, value);
                    }} else {{
                        el.value = value;
                    }}
                    el.dispatchEvent(new Event('input', {{ bubbles: true }}));
                    el.dispatchEvent(new Event('change', {{ bubbles: true }}));
                    if (tag === 'textarea' || tag === 'input') {{
                        el.dispatchEvent(new KeyboardEvent('keyup', {{ bubbles: true, key: 'Enter' }}));
                    }}
                }}

                // 1. Fill Text Inputs (First try data-name query selectors, then fallback)
                let promptEl = document.querySelector('textarea[data-name="description"]');
                let negEl = document.querySelector('textarea[data-name="negative"]');

                if (!promptEl || !negEl) {{
                    let textAreas = document.querySelectorAll('textarea');
                    for (let ta of textAreas) {{
                        let placeholder = (ta.placeholder || "").toLowerCase();
                        if (placeholder.includes("dont want") || placeholder.includes("don't want") || placeholder.includes("things you")) {{
                            if (!negEl) negEl = ta;
                        }} else if (!placeholder.includes("store") && !placeholder.includes("use this text box")) {{
                            if (!promptEl) promptEl = ta;
                        }}
                    }}
                }}

                // Final fallback if selector attributes miss completely
                if (!promptEl) promptEl = document.querySelector("{prompt_selector}");
                if (!negEl) negEl = document.querySelector("{negative_selector}");

                if (promptEl) {{
                    setReactValue(promptEl, {json.dumps(payload.prompt)});
                }}
                if (negEl) {{
                    setReactValue(negEl, {json.dumps(payload.negative_prompt or '')});
                }}

                // 2. Fill Dropdowns (First try explicit data-name, then safe fallbacks)
                let numImagesSel = document.querySelector('select[data-name="numImages"]');
                let styleSel = document.querySelector('select[data-name="artStyle"]');
                let mixSel = document.querySelector('select[data-name="artStyleMix"]');
                let ratioSel = document.querySelector('select[data-name="shape"]');
                let guidanceSel = document.querySelector('select[data-name="Gscale"]');

                // Safe fallback targeting
                let selects = document.querySelectorAll('select');
                if (!styleSel) {{
                    for (let s of selects) {{
                        let html = s.innerHTML || "";
                        let dataName = s.getAttribute("data-name") || "";
                        if (dataName !== "artStyleMix" && (html.includes("ref:optionKeyName:Painted Anime") || html.includes("ref:optionKeyName:Casual Photo"))) {{
                            styleSel = s;
                            break;
                        }}
                    }}
                }}
                if (!mixSel) {{
                    for (let s of selects) {{
                        let html = s.innerHTML || "";
                        let dataName = s.getAttribute("data-name") || "";
                        if (dataName === "artStyleMix" || (html.includes("ref:optionKeyName:Not Mix") && dataName !== "artStyle")) {{
                            mixSel = s;
                            break;
                        }}
                    }}
                }}
                if (!ratioSel) {{
                    for (let s of selects) {{
                        let text = s.innerText.toLowerCase();
                        if (text.includes("512x768") || text.includes("portrait(")) {{
                            ratioSel = s;
                            break;
                        }}
                    }}
                }}
                if (!guidanceSel) {{
                    for (let s of selects) {{
                        let text = s.innerText.toLowerCase();
                        if (text.includes("guidance") || text.includes("default(")) {{
                            guidanceSel = s;
                            break;
                        }}
                    }}
                }}
                if (!numImagesSel) {{
                    for (let s of selects) {{
                        let text = s.innerText.toLowerCase();
                        if (text.includes("1") && text.includes("2") && text.includes("3") && s.options.length < 40) {{
                            numImagesSel = s;
                            break;
                        }}
                    }}
                }}

                // Set values if elements are present
                if (numImagesSel) {{
                    let num_val = "{payload.num_images or 1}";
                    setReactValue(numImagesSel, num_val);
                }}
                if (styleSel) {{
                    let style_val = {json.dumps(payload.style)} || "ref:optionKeyName:Painted Anime Plus";
                    if (!style_val || style_val.trim() === "") style_val = "ref:optionKeyName:Painted Anime Plus";
                    setReactValue(styleSel, style_val);
                }}
                if (ratioSel) {{
                    let ratio_val = {json.dumps(payload.aspect_ratio)} || "512x768";
                    if (!ratio_val || ratio_val.trim() === "") ratio_val = "512x768";
                    
                    let found = false;
                    for (let i = 0; i < ratioSel.options.length; i++) {{
                        let opt = ratioSel.options[i];
                        if (opt.value.includes(ratio_val) || opt.text.includes(ratio_val)) {{
                            setReactValue(ratioSel, opt.value);
                            found = true;
                            break;
                        }}
                    }}
                    if (!found) {{
                        setReactValue(ratioSel, ratio_val);
                    }}
                }}
                if (guidanceSel) {{
                    let guidance_val = "{payload.guidance_scale or 7}";
                    if (!guidance_val || guidance_val.trim() === "") guidance_val = "7";
                    setReactValue(guidanceSel, guidance_val);
                }}
                if (mixSel) {{
                    let mix_val = {json.dumps(payload.style_mix)} || "ref:optionKeyName:Not Mix";
                    if (!mix_val || mix_val.trim() === "") mix_val = "ref:optionKeyName:Not Mix";
                    setReactValue(mixSel, mix_val);
                }}

                // 3. Fill Seed
                let seedEl = document.querySelector('input[data-name="seed"]') || document.getElementById('imageSeed') || document.querySelector('input[id*="seed" i]');
                if (seedEl) {{
                    setReactValue(seedEl, {json.dumps(payload.seed or '')});
                }}

                return `numImages: ${{!!numImagesSel}}, styleSel: ${{styleSel ? (styleSel.getAttribute('data-name') || 'has-style') : 'null'}}, mixSel: ${{mixSel ? (mixSel.getAttribute('data-name') || 'has-mix') : 'null'}}, ratioSel: ${{!!ratioSel}}, guidanceSel: ${{!!guidanceSel}}`;
            }} catch(e) {{
                return "error: " + e.message;
            }}
            """
            fill_log = generator_frame.run_js(js_fill_everything)
            print(f"[BROWSER-FILL-LOG] {fill_log}")


            # baseline scrape of existing images in the tab so we don't return old ones
            baseline_srcs = set()
            try:
                js_get_srcs = """
                try {
                    let list = [];
                    let imgs = document.querySelectorAll('img, canvas');
                    for (let el of imgs) {
                        let tag = el.tagName.toLowerCase();
                        if (tag === 'img') {
                            let src = el.src || el.getAttribute('src') || '';
                            if (src.length > 1000) list.push(src);
                        } else if (tag === 'canvas') {
                            try {
                                let data = el.toDataURL('image/png');
                                if (data.length > 20000) list.push(data);
                            } catch(e) {}
                        }
                    }
                    return list;
                } catch(e) { return []; }
                """
                for f in client_instance.core._get_all_frames(active_tab):
                    try:
                        srcs = f.run_js(js_get_srcs)
                        if srcs:
                            baseline_srcs.update(srcs)
                    except:
                        pass
            except Exception as e:
                print("[SSE] Error getting baseline srcs:", e)

            # Define target image count beforehand
            target_num_images = payload.num_images or 1

            click_and_verify_js = """
            try {
                function isVis(el) {
                    if (!el || el.disabled) return false;
                    if (el.offsetWidth > 0 && el.offsetHeight > 0) return true;
                    let rect = el.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0;
                }
                function trigger(el) {
                    el.focus();
                    el.click();
                    ['mousedown', 'mouseup', 'click'].forEach(evt => {
                        el.dispatchEvent(new MouseEvent(evt, {bubbles: true, cancelable: true, view: window}));
                    });
                }
                
                // 1. Direct target ID
                let btn = document.getElementById('generateButtonEl');
                if (btn && isVis(btn)) {
                    trigger(btn);
                    return "id_click";
                }
                
                // 2. Selectors sequence fallback
                let selectors = ['[data-name="generateButton"]', 'button[id*="generate" i]', '.generate-btn', 'button'];
                for (let sel of selectors) {
                    let els = document.querySelectorAll(sel);
                    for (let el of els) {
                        if (isVis(el)) {
                            let text = (el.innerText || el.value || '').toLowerCase();
                            if (text.includes('generate') || text.includes('create') || text.includes('submit') || text.includes('draw')) {
                                trigger(el);
                                return "selector_click";
                            }
                        }
                    }
                }
                
                // 3. Last resort fallback to any visible button containing generate/create
                let allBtns = document.querySelectorAll('button, .button, [role="button"]');
                for (let b of allBtns) {
                    if (isVis(b)) {
                        let t = (b.innerText || b.value || '').toLowerCase();
                        if (t.includes('generate') || t.includes('create') || t.includes('submit') || t.includes('draw')) {
                            trigger(b);
                            return "fallback_click";
                        }
                    }
                }
                return "not_found";
            } catch(e) { return "error: " + e.message; }
            """
            click_res = generator_frame.run_js(click_and_verify_js)
            print(f"[BROWSER-CLICK-LOG] Triggered click action: {click_res}")
            yield sse_pack("stage", {"step": 4, "text": f"Generating {target_num_images} image(s)..."})

            # Stage 4: Progressive Polling Loop
            yielded_srcs = set()
            max_timeout = 180 # Total timeout threshold (Increased for 6 image batches)
            start_poll = time.time()
            
            while len(yielded_srcs) < target_num_images:
                # Active thread-safe request cancellation check (per-tab)
                if allocated_tab_info["current_gen_id"] != this_gen_id:
                    print(f"[SSE] Newer generation request detected on tab {allocated_tab_info['id'] + 1}. Safely aborting this obsolete run.")
                    break

                # Internet connectivity auto-recovery check mid-process
                if not is_internet_available():
                    yield sse_pack("stage", {"step": 4, "text": "Connection interrupted. Pausing synthesis..."})
                    print("[SSE] Internet disconnected during polling. Pausing...")
                    recovery_start = time.time()
                    while not is_internet_available():
                        if time.time() - recovery_start > 60.0:
                            yield sse_pack("error", "Connection lost mid-generation and could not be restored.")
                            return
                        time.sleep(2)
                    yield sse_pack("stage", {"step": 4, "text": "Connection restored. Resuming synthesis..."})
                    print("[SSE] Internet restored. Resuming generation poll...")
                    # Re-trigger the generation in case it aborted
                    generator_frame.run_js(click_and_verify_js)
                    start_poll = time.time() # Reset poll timer to prevent early timeouts

                # Active programmatically bypass NSFW modals while waiting on all frames
                for f in client_instance.core._get_all_frames(active_tab):
                    try:
                        f.run_js(BYPASS_NSFW_JS)
                    except:
                        pass
                
                # Scrape new images directly from all frames
                current_scrapes = []
                try:
                    js_extract = """
                    try {
                        let results = [];
                        let imgs = document.querySelectorAll('img, canvas');
                        for (let el of imgs) {
                            let tag = el.tagName.toLowerCase();
                            if (tag === 'img') {
                                    let src = el.src || el.getAttribute('src') || '';
                                    if (src.length > 1000) results.push(src);
                            } else if (tag === 'canvas') {
                                try {
                                    let data = el.toDataURL('image/png');
                                    if (data.length > 20000) results.push(data);
                                } catch(e) {}
                            }
                        }
                        return results;
                    } catch(e) { return []; }
                    """
                    for f in client_instance.core._get_all_frames(active_tab):
                        try:
                            srcs = f.run_js(js_extract)
                            if srcs:
                                current_scrapes.extend(srcs)
                        except:
                            pass
                except Exception as e:
                    print("[SSE] Error during frame polling:", e)
                
                # Determine new items
                for src in current_scrapes:
                    if src not in baseline_srcs and src not in yielded_srcs:
                        yielded_srcs.add(src)
                        
                        # Pack Base64 image payload
                        clean_b64 = ""
                        if src.startswith("data:image/"):
                            clean_b64 = src.split(",", 1)[1]
                        elif src.startswith("http"):
                            # Handle HTTP downloads
                            try:
                                req = urllib.request.Request(src, headers={'User-Agent': 'Mozilla/5.0'})
                                with urllib.request.urlopen(req, timeout=10) as response:
                                    clean_b64 = base64.b64encode(response.read()).decode('utf-8')
                            except Exception as e:
                                print("[SSE] Fail to download HTTP src:", e)
                                clean_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                        else:
                            clean_b64 = src
                        
                        # Automatically save image to local folder "gens"
                        save_image_locally(clean_b64, payload.prompt, len(yielded_srcs) - 1)

                        # Instantly yield back to the client!
                        yield sse_pack("image", {
                            "index": len(yielded_srcs) - 1,
                            "total": target_num_images,
                            "b64": clean_b64
                        })
                
                if (time.time() - start_poll) > max_timeout:
                    print(f"[SSE] Generation timeout triggered after {max_timeout}s.")
                    break
                    
                time.sleep(0.4) # Poll every 400 milliseconds

            # Send complete event
            yield sse_pack("complete", {"count": len(yielded_srcs)})

        except Exception as ex:
            print("[SSE] Error occurred in generator loop:", ex)
            yield sse_pack("error", str(ex))
        finally:
            is_extra = allocated_tab_info.get("is_extra", False)
            if is_extra:
                print(f"[SSE] Cleaning up temporary extra tab (ID: {allocated_tab_info['id']})...")
                try:
                    if allocated_tab_info in tab_pool:
                        tab_pool.remove(allocated_tab_info)
                except Exception as e:
                    print("[SSE] Error removing tab from pool:", e)
                try:
                    allocated_tab_info["tab"].close()
                except Exception as e:
                    print("[SSE] Error closing tab:", e)
                try:
                    allocated_tab_info["lock"].release()
                except:
                    pass
            else:
                print("[SSE] Releasing session lock on main tab...")
                allocated_tab_info["lock"].release()

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/api/status")
def get_browser_status():
    return {
        "ready": pool_initialized.is_set(),
        "error": pool_error
    }


# 5. Host Frontend UI Static Files
static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def read_root():
    index_file = os.path.join(static_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return HTMLResponse("<h2>Frontend static files not created yet. Phase 3 is pending.</h2>")

if __name__ == "__main__":
    import uvicorn
    # Now `python app.py` will start the server!
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
