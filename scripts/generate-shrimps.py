#!/usr/bin/env python3
"""Generate shrimp character images using Flux Dev on ComfyUI."""

import json
import urllib.request
import urllib.error
import time
import sys
import os
import uuid

COMFYUI_URL = "http://192.168.150.180:8188"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "characters")

# Flux 1 Dev workflow config
UNET_MODEL = "flux_dev_fp8_scaled_diffusion_model.safetensors"
CLIP1 = "clip_l.safetensors"
CLIP2 = "t5xxl_fp8_e4m3fn_scaled.safetensors"
VAE_MODEL = "FLUX1/ae.sft"

STYLE_PREFIX = "cute kawaii cartoon shrimp character, modern indie game illustration, clean lines, soft warm colors, expressive face, rosy cheeks, segmented body with shell ridges, small tail fan, two antennae, little legs, white background, centered, no text, no watermark, single character"

STAGES = {
    "stage1": {
        "happy": f"{STYLE_PREFIX}, curled up in tight C-shape like someone with terrible posture, big round shiny eyes with highlights, gentle happy smile, waving one small claw, soft peach salmon coral colors, droopy but cheerful",
        "neutral": f"{STYLE_PREFIX}, curled up in tight C-shape like someone with terrible posture, open eyes with neutral expression, straight small mouth, soft peach salmon colors",
        "sad": f"{STYLE_PREFIX}, curled up in tight C-shape looking sad and defeated, droopy half-closed sleepy eyes, small frown, droopy antennae pointing down, desaturated muted pinkish gray colors, tired and defeated but still cute",
    },
    "stage2": {
        "happy": f"{STYLE_PREFIX}, slightly uncurling from C-shape, one eye bigger and more alert as if waking up, curious happy smile, warm peach coral colors slightly brighter, small legs trying to stand, antennae slightly raised",
        "neutral": f"{STYLE_PREFIX}, slightly uncurling from C-shape, neutral curious expression, one eye half open, warm peach colors, small legs visible",
        "sad": f"{STYLE_PREFIX}, slightly uncurling from C-shape but giving up, droopy tired eyes, small frown, desaturated warm tones, legs dangling, antennae droopy",
    },
    "stage3": {
        "happy": f"{STYLE_PREFIX}, halfway uncurled and trying to stand upright, wobbly hopeful expression, big determined eyes with sparkle, enthusiastic smile, small arms raised excitedly, warm coral peach colors getting brighter, tail fan spreading out, legs planted on ground, antennae perked up",
        "neutral": f"{STYLE_PREFIX}, halfway uncurled trying to stand upright, neutral focused expression, warm coral colors, legs planted, tail fan half spread",
        "sad": f"{STYLE_PREFIX}, halfway uncurled but slouching back down, wobbly sad posture, small frown, desaturated coral tones, drooping antennae, losing motivation",
    },
    "stage4": {
        "happy": f"{STYLE_PREFIX}, standing mostly upright with confident posture, big proud wide smile, bright sparkling eyes with large highlights, confident pose with arms out, warm golden coral vibrant saturated colors, bold shell segment lines, tail fan fully spread proudly, strong legs firmly planted, antennae pointing up alertly",
        "neutral": f"{STYLE_PREFIX}, standing mostly upright, calm confident neutral expression, warm golden coral colors, tail fan spread, strong stance",
        "sad": f"{STYLE_PREFIX}, standing mostly upright but shoulders slumped, sad disappointed eyes, small frown, posture deflated, muted golden tan colors, drooping antennae forward, having a bad day",
    },
    "stage5": {
        "happy": f"{STYLE_PREFIX}, standing fully upright like a tiny superhero, wearing a small golden crown with colorful jewels, triumphant beaming radiant smile, large sparkling eyes, flexing arms like a champion bodybuilder, subtle golden glow and sparkles around crown, warm golden amber rich vibrant colors, magnificent tail fan spread wide like a peacock, heroic power stance, majestic long antennae reaching upward",
        "neutral": f"{STYLE_PREFIX}, standing fully upright wearing a small golden crown, calm regal dignified expression, golden amber colors, magnificent tail fan, strong noble stance",
        "sad": f"{STYLE_PREFIX}, standing upright but visibly deflated, wearing slightly tilted golden crown, sad disappointed eyes looking down, downturned mouth, arms hanging limply at sides, desaturated golden gray tones, crown slightly askew, still majestic but deeply sad, a disappointed king",
    },
}

NEGATIVE_PROMPT = "realistic, 3d render, photography, dark, scary, horror, multiple characters, text, watermark, signature, logo, words, letters, blurry, low quality, deformed, ugly, extra limbs"


def build_workflow(prompt: str, negative: str, seed: int) -> dict:
    """Build a ComfyUI workflow for Flux 1 Dev text-to-image."""
    return {
        "3": {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": UNET_MODEL,
                "weight_dtype": "fp8_e4m3fn",
            },
        },
        "4": {
            "class_type": "DualCLIPLoader",
            "inputs": {
                "clip_name1": CLIP1,
                "clip_name2": CLIP2,
                "type": "flux",
            },
        },
        "5": {
            "class_type": "VAELoader",
            "inputs": {
                "vae_name": VAE_MODEL,
            },
        },
        "6": {
            "class_type": "CLIPTextEncodeFlux",
            "inputs": {
                "clip_l": prompt,
                "t5xxl": prompt,
                "guidance": 3.5,
                "clip": ["4", 0],
            },
        },
        "7": {
            "class_type": "EmptyLatentImage",
            "inputs": {
                "width": 1024,
                "height": 1024,
                "batch_size": 1,
            },
        },
        "8": {
            "class_type": "KSampler",
            "inputs": {
                "model": ["3", 0],
                "positive": ["6", 0],
                "negative": ["9", 0],
                "latent_image": ["7", 0],
                "seed": seed,
                "steps": 20,
                "cfg": 1.0,
                "sampler_name": "euler",
                "scheduler": "simple",
                "denoise": 1.0,
            },
        },
        "9": {
            "class_type": "CLIPTextEncodeFlux",
            "inputs": {
                "clip_l": negative,
                "t5xxl": negative,
                "guidance": 3.5,
                "clip": ["4", 0],
            },
        },
        "10": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["8", 0],
                "vae": ["5", 0],
            },
        },
        "11": {
            "class_type": "SaveImage",
            "inputs": {
                "images": ["10", 0],
                "filename_prefix": "shrimper",
            },
        },
    }


def queue_prompt(workflow: dict) -> str:
    """Queue a prompt on ComfyUI and return the prompt_id."""
    client_id = str(uuid.uuid4())
    payload = json.dumps({"prompt": workflow, "client_id": client_id}).encode()
    req = urllib.request.Request(
        f"{COMFYUI_URL}/prompt",
        data=payload,
        headers={"Content-Type": "application/json"},
    )
    resp = urllib.request.urlopen(req, timeout=30)
    data = json.loads(resp.read())
    return data["prompt_id"]


def wait_for_completion(prompt_id: str, timeout: int = 300) -> dict:
    """Poll ComfyUI history until the prompt completes."""
    start = time.time()
    while time.time() - start < timeout:
        try:
            resp = urllib.request.urlopen(f"{COMFYUI_URL}/history/{prompt_id}", timeout=10)
            data = json.loads(resp.read())
            if prompt_id in data:
                return data[prompt_id]
        except Exception:
            pass
        time.sleep(2)
    raise TimeoutError(f"Prompt {prompt_id} did not complete within {timeout}s")


def download_image(filename: str, subfolder: str, output_path: str) -> None:
    """Download a generated image from ComfyUI."""
    url = f"{COMFYUI_URL}/view?filename={filename}&subfolder={subfolder}&type=output"
    resp = urllib.request.urlopen(url, timeout=30)
    with open(output_path, "wb") as f:
        f.write(resp.read())


def generate_image(prompt: str, output_path: str, seed: int) -> bool:
    """Generate one image via ComfyUI Flux workflow."""
    workflow = build_workflow(prompt, NEGATIVE_PROMPT, seed)

    try:
        prompt_id = queue_prompt(workflow)
        print(f"    queued: {prompt_id[:8]}...", end="", flush=True)

        result = wait_for_completion(prompt_id)
        print(" done!", end="", flush=True)

        # Extract output image
        outputs = result.get("outputs", {})
        for node_id, node_output in outputs.items():
            if "images" in node_output:
                img = node_output["images"][0]
                download_image(img["filename"], img.get("subfolder", ""), output_path)
                size_kb = os.path.getsize(output_path) // 1024
                print(f" saved ({size_kb}KB)")
                return True

        print(" ERROR: no images in output")
        return False

    except Exception as e:
        print(f" ERROR: {e}")
        return False


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Verify ComfyUI is reachable
    try:
        resp = urllib.request.urlopen(f"{COMFYUI_URL}/system_stats", timeout=5)
        stats = json.loads(resp.read())
        gpu = stats["devices"][0]["name"]
        print(f"ComfyUI: {COMFYUI_URL}")
        print(f"GPU: {gpu}")
        print(f"Model: {UNET_MODEL}")
        print(f"Output: {OUTPUT_DIR}")
        print()
    except Exception as e:
        print(f"ERROR: Cannot reach ComfyUI at {COMFYUI_URL}: {e}")
        sys.exit(1)

    total = sum(len(moods) for moods in STAGES.values())
    done = 0
    failed = 0
    base_seed = 42  # Fixed seed per stage for consistency

    for stage_idx, (stage_name, moods) in enumerate(STAGES.items()):
        for mood_idx, (mood_name, prompt) in enumerate(moods.items()):
            done += 1
            output_path = os.path.join(OUTPUT_DIR, f"{stage_name}-{mood_name}.png")

            if os.path.exists(output_path) and "--force" not in sys.argv:
                print(f"[{done}/{total}] SKIP {stage_name}-{mood_name} (exists)")
                continue

            seed = base_seed + stage_idx * 100 + mood_idx
            print(f"[{done}/{total}] {stage_name}-{mood_name} (seed={seed})...", end="", flush=True)

            if not generate_image(prompt, output_path, seed):
                failed += 1

    print(f"\nDone! {done - failed}/{total} generated, {failed} failed")
    print(f"Images in: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
