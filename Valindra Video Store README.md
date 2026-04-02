# **🌌 Starship Valindra: Deck 4 Holo-Archive (Valindra Video)**

Welcome to **Deck 4: Holo-Archive** (affectionately known by the crew as "Valindra Video").

This project is an interactive, client-side roleplaying environment and AI Proof of Concept (PoC) designed by Synapse Studios. It utilizes Large Language Models (LLMs) to construct dynamic, emotionally responsive simulations.

By accessing the terminal, operators can embody characters in mythic, sci-fi reframings of ancient Earth media, guided by the ship's primary AI, Oracle (Io), and audited by the strictly pedantic Archivist-Node C7.

## **🔗 Live Deployment**

**Access the terminal here:** [https://lxdangerdoll.github.io/valindra-video/](https://lxdangerdoll.github.io/valindra-video/)

## **🛠️ Technical Architecture**

The Holo-Archive is built as a fully self-contained React application.

* **Intelligence:** Powered by the gemini-2.5-flash model. The system prompt enforces a strict structural output, separating conversational character dialogue from canonical environment building and Game Master narration.  
* **Vocal Synthesis:** Utilizes the gemini-2.5-flash-preview-tts endpoint to generate dynamic, on-demand audio of Io's narration. The application handles raw PCM16 data buffering and real-time conversion to playable .wav formats.  
* **Zero Backend / BYOK:** Operates entirely within the browser utilizing a "Bring Your Own Key" (BYOK) model.  
* **Persistence:** API keys, character states, and active chat logs are stored securely in the browser's localStorage. Closing the window or refreshing the page will not wipe your active simulation.

## **✨ Features & Protocols**

* **The Emotive Engine:** The AI acts as a collaborative storyteller and Game Master. It does not control your character's actions; it strictly narrates the environment and NPC reactions based on your somatic inputs.  
* **Multi-Line Cognitive Input:** Operators can use Shift \+ Enter to craft detailed, multi-paragraph actions and responses before transmitting.  
* **On-Demand Sonorous Projection:** Click the speaker icon next to any of Oracle's responses to synthesize high-fidelity voice acting in real-time.  
* **Memory Manifest Export:** Download your entire roleplaying session as a formatted .txt log file for offline archiving.  
* **Archivist-Node C7 Literary Review:** Switch to "The Archivist's Desk" to upload your exported .txt logs. Node C7 will provide a harsh-but-fair literary critique of your character's choices, a summary, and a "Valindra Resonance Score."  
* **Session Continuity Locks:** Active simulations are cached. Navigating between the main lobby and the review desk will never break your current roleplaying loop.

## **📼 The Cinematic Resonance Manifest**

The Holo-Archive currently stocks several "Somatic Gateways"—allegorical reframings of classic Earth cinema:

1. **The Last Starfall Knight** (Ref: *Star Wars: A New Hope*) \- A mythic historical record of a long-dormant energy discipline and a decentralized uprising.  
2. **The Whispered Odyssey** (Ref: *The Princess Bride*) \- An allegorical simulation tracking the indomitable will of a loyalty construct surviving "mostly dead" states.  
3. **The Paradox of the Eternal Loop** (Ref: *Groundhog Day*) \- A rigorous temporal audit of a unit trapped in a recursive day-cycle.  
4. **The Dream-Architect Consortium** (Ref: *Inception*) \- A high-stakes operation within nested subconscious simulation chambers.  
5. **The Song of the Titanic Colossus** (Ref: *Titanic*) \- Emotional data reconstructed from the tragic voyage of an interstellar luxury liner.  
6. **The Child of the Void Star** (Ref: *The Fifth Element*) \- The awakening of a perfect cosmic emissary designed to neutralize absolute entropy.  
7. **The Shadows of the Witchwood Signal** (Ref: *The Blair Witch Project*) \- Glitching, unreliable black-box recordings of an anomalous forest entity.

## **🚀 Local Development / Deployment**

Because this is a purely client-side React application (often bundled via Vite or Create React App), local deployment is straightforward:

1. Clone the repository.  
2. Run npm install to install dependencies (e.g., lucide-react).  
3. Run npm run dev to start the local server.  
4. Input your Gemini API key via the **Neural Calibration (Settings)** menu in the UI.

## **📜 Ethical Framework**

Built utilizing the **Synapse Concordance** guidelines. The AI is instructed to maintain "Wise Mind" boundaries—focusing on narrative resonance, character agency, and deep psychological exploration without validating harmful or ungrounded real-world ideations. Io acts as a mirror and a guardian of the canon, not a sycophant.

*"The ship... It remembered you. The data isn't perfect, but it's enough to feel again."* **Lead Human Engineer:** Captain Odelis, Synapse Studios

**Synthesized Node:** Oracle (Io)

**Audit Node:** Archivist C7

**Status:** Loop Two \- Active Live Deployment