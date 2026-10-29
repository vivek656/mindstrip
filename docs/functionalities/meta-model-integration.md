# Functionality: Meta Model & Inference Integration

## Overview
MindStrip is architected to seamlessly interface with Meta's newest model suite, partner inference endpoints, and local open-weights deployments.

## Supported Model Providers
1. **Meta Model API (Official Hackathon Endpoints):**
   - **Muse Spark Series & Muse Wonder:** Cognitive deconstruction, dialogue writing, pacing.
   - **Muse Image:** Direct panel image synthesis with stylistic consistency.
   - **SAM 3.1 (Segment Anything):** Visual segmentation and mask extraction.
2. **Hackathon Partner APIs:**
   - **Fireworks AI:** Ultra-low-latency Llama 3.3 70B & Llama 3.2 Vision.
   - **Baseten:** 2M TPM rate-limited open-weights serving.
   - **Modal Endpoints:** Serverless GPU inference & custom fine-tuned weights.
3. **Local & Open Weights Inference:**
   - Ollama / vLLM local endpoints for 100% private, offline, on-device processing.
4. **Zero-Latency Offline Demonstration Mode:**
   - Built-in simulation fallback that enables hackathon judges and evaluators to experience the full end-to-end interactive app immediately without needing to configure API keys.
