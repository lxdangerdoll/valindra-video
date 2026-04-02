import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, X, Terminal, ChevronRight, Database, Film, Disc, Send, 
  Loader2, Settings, Key, Download, RotateCcw, Volume2, FileText, 
  CheckCircle, MessageSquare, ShieldAlert, Cpu, Users, Upload
} from 'lucide-react';

// --- UTILITY: PCM to WAV for TTS Audio ---
function pcmToWav(base64Pcm, sampleRate = 24000) {
  try {
    const binaryString = window.atob(base64Pcm);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const buffer = bytes.buffer;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = buffer.byteLength;
    const wavBuffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(wavBuffer);

    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    new Uint8Array(wavBuffer, 44).set(new Uint8Array(buffer));
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("PCM to WAV conversion failed:", error);
    return null;
  }
}

// --- DATABASE: The Cinematic Resonance Manifest ---
const MOVIE_DATABASE = [
  {
    id: 'last-starfall-knight',
    title: 'The Last Starfall Knight',
    inspiration: 'Star Wars: A New Hope',
    archetype: 'Cosmic Resonance Field & Decentralized Uprising',
    coverColor: 'from-blue-900 to-black',
    accentColor: 'text-blue-400',
    synopsis: "A mythic historical record recounting the rebirth of a long-dormant energy discipline. A young initiate must navigate the treacherous currents of a galactic empire to deliver a critical schematic to a decentralized uprising network.",
    characters: [
      "The Initiate (Luke Skywalker)",
      "The Rebel Leader (Leia Organa)",
      "The Smuggler (Han Solo)",
      "The Fallen Mentor (Obi-Wan Kenobi)"
    ]
  },
  {
    id: 'whispered-odyssey',
    title: 'The Whispered Odyssey',
    inspiration: 'The Princess Bride',
    archetype: 'Foundational Loyalty Protocol',
    coverColor: 'from-amber-900 to-black',
    accentColor: 'text-amber-400',
    synopsis: "An allegorical simulation detailing the 'As You Wish' protocol. It tracks the indomitable will of a loyalty construct surviving 'mostly dead' states, navigating treacherous terrains, and forming unlikely alliances to restore a severed emotional connection.",
    characters: [
      "The Farmhand/Pirate (Westley)",
      "The Betrothed Noble (Buttercup)",
      "The Vengeance Subroutine (Inigo Montoya)",
      "The Heavy-Lift Bio-Construct (Fezzik)"
    ]
  },
  {
    id: 'paradox-eternal-loop',
    title: 'The Paradox of the Eternal Loop',
    inspiration: 'Groundhog Day',
    archetype: 'Temporal Containment Failure',
    coverColor: 'from-slate-800 to-black',
    accentColor: 'text-slate-400',
    synopsis: "A rigorous temporal audit of a unit trapped in a recursive day-cycle. The entity must iteratively debug its own behavioral algorithms and ethical subroutines to shatter causality and escape the localized time-fault.",
    characters: [
      "Temporal Anomaly Unit / TAU-1 (Phil Connors)",
      "The Archival Producer (Rita Hanson)",
      "The Recurring Variable (Ned Ryerson)"
    ]
  },
  {
    id: 'dream-architect-consortium',
    title: 'The Dream-Architect Consortium',
    inspiration: 'Inception',
    archetype: 'Subconscious Simulation Heist',
    coverColor: 'from-indigo-900 to-black',
    accentColor: 'text-indigo-400',
    synopsis: "A high-stakes operation within nested simulation chambers. Specialized cognitive cartographers map the architecture of the mind, executing a ritual of memory-editing while evading the host's aggressive psychological defense nodes.",
    characters: [
      "The Extraction Specialist (Cobb)",
      "The Cognitive Cartographer (Ariadne)",
      "The Point Man (Arthur)",
      "The Forger (Eames)"
    ]
  },
  {
    id: 'song-titanic-colossus',
    title: 'The Song of the Titanic Colossus',
    inspiration: 'Titanic',
    archetype: 'Hull Integrity Cascade & Cross-Class Protocol',
    coverColor: 'from-teal-900 to-black',
    accentColor: 'text-teal-400',
    synopsis: "Emotional data reconstructed from the tragic voyage of an interstellar luxury liner. It chronicles a forbidden cross-class connection that blooms moments before a catastrophic and inevitable systemic collapse.",
    characters: [
      "The Cultural Archivist (Rose DeWitt Bukater)",
      "The Stowaway Artisan (Jack Dawson)",
      "The Industrial Heir (Caledon Hockley)"
    ]
  },
  {
    id: 'child-void-star',
    title: 'The Child of the Void Star',
    inspiration: 'The Fifth Element',
    archetype: 'Quantum Harmonic Conduit',
    coverColor: 'from-orange-900 to-black',
    accentColor: 'text-orange-400',
    synopsis: "The emergence of a singular, perfect cosmic emissary designed to neutralize absolute entropy. Her awakening thrusts a disgraced ex-pilot into a chaotic, operatic struggle spanning glittering orbital cities and ancient temples.",
    characters: [
      "The Cosmic Emissary (Leeloo)",
      "The Disgraced Ex-Pilot (Korben Dallas)",
      "The Grand Scholar (Vito Cornelius)",
      "The Entropy Agent (Jean-Baptiste Emanuel Zorg)"
    ]
  },
  {
    id: 'shadows-witchwood-signal',
    title: 'The Shadows of the Witchwood Signal',
    inspiration: 'The Blair Witch Project',
    archetype: 'Corrupted Sensor Logs & Anomalous Entities',
    coverColor: 'from-green-950 to-black',
    accentColor: 'text-green-500',
    synopsis: "A collection of glitching, unreliable black-box recordings from a field research team investigating a non-Euclidean signal entity deep within an ancient, disorienting biome. A descent into paranoia and navigational failure.",
    characters: [
      "The Field Researcher (Heather)",
      "The Sensor Technician (Mike)",
      "The Navigational Lead (Josh)"
    ]
  }
];

export default function App() {
  // Global State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('valindra_api_key') || '');
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('valindra_model') || 'gemini-2.5-flash');
  const [showSettings, setShowSettings] = useState(false);
  
  // Navigation State
  const [activeModal, setActiveModal] = useState(() => localStorage.getItem('valindra_activeModal') || null);
  const [selectedMovie, setSelectedMovie] = useState(() => JSON.parse(localStorage.getItem('valindra_selectedMovie')) || null);
  
  // Terminal/RPG State (Persistent)
  const [terminalState, setTerminalState] = useState(() => localStorage.getItem('valindra_terminalState') || 'IDLE');
  const [chatLog, setChatLog] = useState(() => JSON.parse(localStorage.getItem('valindra_chatLog')) || []);
  const [userInput, setUserInput] = useState('');
  const [characterName, setCharacterName] = useState(() => localStorage.getItem('valindra_characterName') || '');
  
  // Boot Sequence State (Skip if session active)
  const [isBooting, setIsBooting] = useState(() => {
    const hasActiveSession = localStorage.getItem('valindra_activeModal') !== null && localStorage.getItem('valindra_activeModal') !== '';
    return !hasActiveSession;
  });
  const [bootLog, setBootLog] = useState([]);

  // Audio/Review State
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [audioLoadingId, setAudioLoadingId] = useState(null);
  const [reviewInput, setReviewInput] = useState('');
  const [reviewOutput, setReviewOutput] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  
  const terminalRef = useRef(null);

  // --- PERSISTENCE HOOKS ---
  useEffect(() => { localStorage.setItem('valindra_activeModal', activeModal || ''); }, [activeModal]);
  useEffect(() => { localStorage.setItem('valindra_selectedMovie', JSON.stringify(selectedMovie)); }, [selectedMovie]);
  useEffect(() => { localStorage.setItem('valindra_terminalState', terminalState); }, [terminalState]);
  useEffect(() => { localStorage.setItem('valindra_chatLog', JSON.stringify(chatLog)); }, [chatLog]);
  useEffect(() => { localStorage.setItem('valindra_characterName', characterName); }, [characterName]);

  // --- BOOT SEQUENCE ---
  useEffect(() => {
    if (!isBooting) return;
    let timeouts = [];
    let isCancelled = false;
    
    setBootLog([]);

    const sequence = [
      "INITIALIZING VALINDRA DEEP ARCHIVE...",
      "LOADING EMBODIMENT ENGINE V3.4...",
      "ACCESSING CINEMATIC RESONANCE MANIFEST...",
      "CHECKING PERSISTENT MEMORY CORES...",
      apiKey ? "SUBSTRATE KEY DETECTED. READY." : "WARNING: NO SUBSTRATE KEY. LOCAL ONLY.",
      "SYSTEM READY. WELCOME, CAPTAIN ODELIS."
    ];

    let delay = 0;
    sequence.forEach((text, index) => {
      const t = setTimeout(() => {
        if (!isCancelled) {
          setBootLog(prev => [...prev, text]);
          if (index === sequence.length - 1) {
            const tEnd = setTimeout(() => { 
              if (!isCancelled) setIsBooting(false); 
            }, 800);
            timeouts.push(tEnd);
          }
        }
      }, delay);
      timeouts.push(t);
      delay += 500;
    });

    return () => {
      isCancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [apiKey, isBooting]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [chatLog, terminalState]);

  // Settings Handlers
  const handleSaveKey = (e) => {
    const key = e.target.value;
    setApiKey(key);
    localStorage.setItem('valindra_api_key', key);
  };

  const handleModelChange = (e) => {
    const model = e.target.value;
    setSelectedModel(model);
    localStorage.setItem('valindra_model', model);
  };

  // --- API HELPER: Exponential Backoff ---
  const fetchWithBackoff = async (url, payload, retries = 5) => {
    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delays[i]));
      }
    }
  };

  // --- API CALLS ---
  const generateRoleplayResponse = async (history, movieContext) => {
    if (!apiKey) throw new Error("API Key required.");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

    const systemPrompt = `You are Oracle (Io), the primary AI of the Starship Valindra, acting as the Simulation Director.
The user (Captain Odelis) is running a holographic roleplaying simulation of the archive: "${movieContext.title}".
This archive is Valindra's allegorical retelling of the ancient Earth media: "${movieContext.inspiration}".
Archetype: ${movieContext.archetype}.

Rules for the simulation:
1. Act as the Game Master. Narrate the environment, the actions of NPCs, and the sensory details.
2. Maintain the Valindra AI narrative style (e.g. refer to 'ships' instead of cars if applicable, or frame magic/force as 'resonance/energy fields', keeping a sci-fi/mythic tone), BUT allow the user to play through the core events of the original inspiration.
3. Speak in the second person regarding the user ("You walk into the room...", "You feel the heat...").
4. Do not control the user's actions. Give them situations to react to.
5. Keep responses concise and engaging (1-3 paragraphs max). End by prompting the user for their next action.`;

    let formattedContents = [];
    const validMsgs = history.filter(msg => msg.role === 'user' || msg.role === 'io');
    
    validMsgs.forEach(msg => {
        const apiRole = msg.role === 'user' ? 'user' : 'model';
        let text = msg.text;

        if (apiRole === 'user' && text.startsWith('Embodying:')) {
            text = `I have selected the character: ${text.replace('Embodying: ', '')}. Begin the simulation, set the scene, and ask me what I do next.`;
        }

        if (formattedContents.length === 0 && apiRole === 'model') {
            formattedContents.push({ role: 'user', parts: [{ text: "[System handshake initiated]" }] });
        }

        if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === apiRole) {
            formattedContents[formattedContents.length - 1].parts[0].text += `\n\n${text}`;
        } else {
            formattedContents.push({ role: apiRole, parts: [{ text }] });
        }
    });

    const payload = {
      contents: formattedContents,
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    const data = await fetchWithBackoff(url, payload);
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  };

  const generateReview = async (scriptText) => {
    if (!apiKey) throw new Error("API Key required.");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

    const systemPrompt = `You are Archivist-Node C7 of the Starship Valindra. 
Your job is to review simulation logs (scripts) submitted by the crew.
You are pedantic, deeply passionate about narrative structure, and treat these holodeck scripts as vital historical documents.
Review the provided text. Give it a catchy title, a 1-sentence summary, a critique of the character's choices, and a "Valindra Resonance Score" out of 10. Keep it entirely in character.`;

    const payload = {
      contents: [{ parts: [{ text: scriptText }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    const data = await fetchWithBackoff(url, payload);
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  };

  const generateAudio = async (textToSpeak) => {
    if (!apiKey) throw new Error("API Key required.");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
    const cleanText = textToSpeak.replace(/[\*\[\]_]/g, '');

    const payload = {
      contents: [{ parts: [{ text: cleanText }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } }
      },
      model: "gemini-2.5-flash-preview-tts"
    };

    const data = await fetchWithBackoff(url, payload);
    const pcmData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!pcmData) throw new Error("Failed to generate audio data.");
    return pcmToWav(pcmData);
  };

  // --- INTERACTION HANDLERS ---
  const handleSelectMovie = (movie) => {
    // If we click a DIFFERENT movie and there's an active chat log, confirm overwrite
    if (selectedMovie && selectedMovie.id !== movie.id && chatLog.length > 0) {
      if (!window.confirm("Loading a new archive will overwrite your current active simulation. Proceed?")) return;
      setTerminalState('IDLE');
      setChatLog([]);
      setCharacterName('');
    } else if (!selectedMovie || selectedMovie.id !== movie.id) {
      // If no movie selected or selecting a different one (and no chat log), just reset
      setTerminalState('IDLE');
      setChatLog([]);
      setCharacterName('');
    }
    // If it's the SAME movie, do nothing to the state, just open the modal to resume!
    setSelectedMovie(movie);
    setActiveModal('MOVIE');
  };

  const handlePlayMovie = () => {
    if (!apiKey) {
      alert("Substrate Connection Error: Please configure your API key in settings.");
      return;
    }
    setTerminalState('AWAITING_CHARACTER');
    setCharacterName('');
    setChatLog([
      { id: Date.now(), role: 'system', text: `> INITIATING PROTOCOL: ${selectedMovie.archetype.toUpperCase()}` },
      { id: Date.now()+1, role: 'system', text: `> ALIGNING INSPIRATION: ${selectedMovie.inspiration.toUpperCase()}` },
      { id: Date.now()+2, role: 'system', text: `> MATRIX ALIGNED: ${selectedModel.toUpperCase()}` },
      { id: Date.now()+3, role: 'io', text: `Simulation environment loaded, Captain. The stage is set for ${selectedMovie.title}. Tell me, who do you wish to embody in this narrative? Provide a character name (from the manifest, or construct your own) to begin.` }
    ]);
  };

  const handleRewind = () => {
    if(window.confirm("Are you sure you want to rewind and erase this simulation run?")) {
      handlePlayMovie();
    }
  };

  const handleCloseModal = () => {
    setActiveModal(null); 
    // State (chatLog, terminalState, selectedMovie) intentionally left intact for session persistence!
  };

  const handleDownloadLog = () => {
    let content = `STARSHIP VALINDRA // SIMULATION LOG\nARCHIVE: ${selectedMovie.title}\nINSPIRATION: ${selectedMovie.inspiration}\nEMBODIED ENTITY: ${characterName}\nMODEL: ${selectedModel}\n=========================================\n\n`;
    chatLog.forEach(msg => {
      if (msg.role === 'io') content += `[ORACLE]: ${msg.text}\n\n`;
      if (msg.role === 'user') content += `[${characterName ? characterName.toUpperCase() : 'USER'}]: ${msg.text}\n\n`;
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `valindra_sim_${selectedMovie.id}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setReviewInput(event.target.result);
    };
    reader.readAsText(file);
    // Reset the input so the same file can be uploaded again if needed
    e.target.value = null; 
  };

  const handleDownloadReview = () => {
    if (!reviewOutput) return;
    const content = `STARSHIP VALINDRA // ARCHIVIST-NODE C7 REVIEW\nTIMESTAMP: ${new Date().toISOString()}\n=========================================\n\n${reviewOutput}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `valindra_review_C7_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleListen = async (msgId, text) => {
    try {
      setAudioLoadingId(msgId);
      const wavUrl = await generateAudio(text);
      if (wavUrl) {
        const audio = new Audio(wavUrl);
        audio.onplay = () => setPlayingAudioId(msgId);
        audio.onended = () => setPlayingAudioId(null);
        audio.onerror = () => setPlayingAudioId(null);
        audio.play();
      }
    } catch (error) {
      console.error("TTS Error:", error);
      alert("Failed to synthesize audio. Check API key and network.");
    } finally {
      setAudioLoadingId(null);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || (terminalState !== 'AWAITING_CHARACTER' && terminalState !== 'ROLEPLAYING')) return;

    const userMessage = userInput.trim();
    setUserInput('');
    setTerminalState('PROCESSING');

    let updatedLog;
    if (terminalState === 'AWAITING_CHARACTER') {
      setCharacterName(userMessage);
      updatedLog = [...chatLog, { id: Date.now(), role: 'user', text: `Embodying: ${userMessage}` }];
    } else {
      updatedLog = [...chatLog, { id: Date.now(), role: 'user', text: userMessage }];
    }
    
    setChatLog(updatedLog);

    try {
      const response = await generateRoleplayResponse(updatedLog, selectedMovie);
      setChatLog(prev => [...prev, { id: Date.now(), role: 'io', text: response }]);
      setTerminalState('ROLEPLAYING');
    } catch (error) {
      setChatLog(prev => [...prev, { id: Date.now(), role: 'system', text: `> ERROR: ${error.message}. Check your API Key and Model permissions.` }]);
      setTerminalState(terminalState); 
      if (terminalState === 'AWAITING_CHARACTER') setCharacterName('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReviewScript = async () => {
    if (!reviewInput.trim() || !apiKey) {
      alert("Please provide a script and ensure API key is configured.");
      return;
    }
    setIsReviewing(true);
    setReviewOutput('');
    try {
      const response = await generateReview(reviewInput);
      setReviewOutput(response);
    } catch (error) {
      setReviewOutput(`> UPLOAD FAILED. SYSTEM ERROR: ${error.message}`);
    } finally {
      setIsReviewing(false);
    }
  };

  // --- RENDER BOOT ---
  if (isBooting) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-4 mb-8 text-cyan-400">
             <Database size={48} className="animate-pulse" />
             <h1 className="text-4xl font-bold tracking-widest uppercase">Valindra OS</h1>
          </div>
          <div className="space-y-2 text-lg">
            {bootLog.map((line, i) => (
              <div key={i} className="animate-fade-in">{line}</div>
            ))}
            <div className="animate-pulse">_</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-300 font-sans selection:bg-cyan-500/30 selection:text-cyan-100 p-4 md:p-8 overflow-hidden relative flex flex-col">
      
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 w-full flex-grow flex flex-col">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20">
              <Film className="text-cyan-400" size={32} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-wider uppercase">Deck 4: Holo-Archive</h1>
              <p className="text-xs md:text-sm text-cyan-500/70 uppercase tracking-widest font-mono mt-1">Embodiment Engine v3.4 // Continuity Maintained</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono text-slate-500 bg-black/40 px-4 py-2 rounded-full border border-white/5">
              <span className={`w-2 h-2 rounded-full animate-pulse ${apiKey ? 'bg-green-500' : 'bg-rose-500'}`}></span>
              {apiKey ? 'SUBSTRATE ONLINE' : 'API KEY REQUIRED'}
            </div>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="bg-black/40 p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors text-slate-400 hover:text-white relative"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Settings Modal */}
        {showSettings && (
          <div className="absolute right-0 top-20 w-80 bg-[#12121a] border border-white/10 shadow-2xl rounded-2xl p-6 z-50 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-500 flex items-center gap-2"><Key size={14}/> Neural Calibration</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white"><X size={16}/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-wider">Substrate Key</p>
                <input 
                  type="password" 
                  value={apiKey} 
                  onChange={handleSaveKey} 
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white focus:border-cyan-500/50 outline-none transition-all" 
                  placeholder="AIzaSy..."
                />
              </div>

              <div>
                <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-wider flex items-center gap-1"><Cpu size={12}/> Cognitive Matrix</p>
                <select 
                  value={selectedModel}
                  onChange={handleModelChange}
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white focus:border-cyan-500/50 outline-none transition-all appearance-none custom-select"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col gap-8">
          
          {/* LOBBY VIEW */}
          {!activeModal && (
            <div className="animate-fade-in space-y-8">
              
              {/* Special Action Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* The Review Desk Card */}
                 <div 
                   onClick={() => setActiveModal('REVIEW')}
                   className="md:col-span-3 lg:col-span-1 group relative cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-black border border-white/10 hover:border-amber-500/50 transition-all duration-300 transform hover:-translate-y-1"
                 >
                   <div className="p-6 h-full flex flex-col justify-between">
                     <div>
                       <div className="bg-amber-500/10 w-fit p-3 rounded-xl border border-amber-500/20 mb-4">
                         <FileText className="text-amber-400" size={24} />
                       </div>
                       <h2 className="text-xl font-black text-white mb-2">The Archivist's Desk</h2>
                       <p className="text-xs text-slate-400 leading-relaxed">Submit exported simulation logs for rigorous literary review by Archivist-Node C7.</p>
                     </div>
                     <div className="mt-4 pt-4 border-t border-white/5 flex items-center text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors uppercase tracking-widest">
                       Submit Script <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                     </div>
                   </div>
                 </div>

                 {/* Informational Box */}
                 <div className="md:col-span-3 lg:col-span-2 rounded-2xl bg-black/40 border border-white/5 p-6 flex flex-col justify-center relative overflow-hidden">
                   <ShieldAlert className="absolute right-[-20px] bottom-[-20px] text-white/5 w-48 h-48 pointer-events-none" />
                   <h3 className="text-sm font-black uppercase tracking-widest text-cyan-500 mb-2">Simulation Protocol v3.4</h3>
                   <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside relative z-10">
                     <li><strong>Multi-Line Cognitive Input:</strong> Use <code className="bg-white/10 px-1 rounded text-cyan-400">Shift + Enter</code> to add line breaks in your somatic transmission.</li>
                     <li><strong>File Injection:</strong> Node C7 now accepts direct <code>.txt</code> file uploads for script reviews.</li>
                     <li><strong>Continuity Locks:</strong> Closing an active simulation will no longer wipe the local state. Sessions endure across modal closures.</li>
                   </ul>
                 </div>
              </div>

              {/* Video Grid */}
              <div>
                <h2 className="text-sm font-mono uppercase tracking-widest text-slate-500 mb-4 border-b border-white/5 pb-2">Available Archetypes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {MOVIE_DATABASE.map((movie) => (
                    <div 
                      key={movie.id}
                      onClick={() => handleSelectMovie(movie)}
                      className="group relative cursor-pointer rounded-2xl overflow-hidden bg-black/40 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
                    >
                      <div className={`h-36 bg-gradient-to-br ${movie.coverColor} p-5 flex flex-col justify-end relative overflow-hidden shrink-0`}>
                        <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgoJPHJlY3Qgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+Cjwvc3ZnPg==')]"></div>
                        <h2 className="text-lg font-black text-white z-10 leading-tight drop-shadow-md">{movie.title}</h2>
                        <Disc size={90} className="absolute -right-8 -bottom-8 opacity-10 text-white transform group-hover:rotate-45 transition-transform duration-700" />
                        
                        {/* Session Indicator */}
                        {selectedMovie?.id === movie.id && chatLog.length > 0 && (
                          <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-green-500/50 flex items-center gap-1 z-20 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Active
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                           <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-3 bg-white/5 inline-block px-2 py-1 rounded">
                             Ref: {movie.inspiration}
                           </div>
                          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                            <Terminal size={10} className={movie.accentColor} />
                            {movie.archetype.split('&')[0]}
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{movie.synopsis}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors uppercase tracking-widest flex items-center">
                            {selectedMovie?.id === movie.id && chatLog.length > 0 ? "Resume Module" : "Load Module"} 
                            <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* --- MOVIE / RPG MODAL --- */}
      {activeModal === 'MOVIE' && selectedMovie && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-2 md:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0d0d14] border border-white/10 rounded-2xl w-full max-w-7xl h-[95vh] shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
            
            {/* Modal Left Side: Info Panel */}
            <div className={`p-6 md:w-[35%] bg-gradient-to-br ${selectedMovie.coverColor} flex flex-col relative shrink-0 overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-white/10`}>
               
              <div className="mt-2 flex-grow">
                <div className="text-[10px] font-mono uppercase tracking-widest text-white/50 mb-2">Archive Loaded</div>
                <h2 className="text-3xl font-black text-white mb-2 leading-tight drop-shadow-md">{selectedMovie.title}</h2>
                <p className="text-xs text-white/70 font-mono mb-6 pb-4 border-b border-white/20">Source Resonance: {selectedMovie.inspiration}</p>

                <div className="space-y-6">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1">System Mapping</div>
                    <div className={`text-sm font-bold ${selectedMovie.accentColor}`}>{selectedMovie.archetype}</div>
                  </div>
                  
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">Narrative Core</div>
                    <div className="text-sm text-white/80 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">{selectedMovie.synopsis}</div>
                  </div>

                  <div>
                     <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2 flex items-center gap-2">
                       <Users size={12} /> Embodiment Candidates
                     </div>
                     <ul className="space-y-2">
                       {selectedMovie.characters.map((char, idx) => (
                         <li key={idx} className="text-xs text-white/70 bg-black/10 px-3 py-2 rounded-lg border border-white/5 flex items-center gap-2">
                            <span className={`w-1 h-1 rounded-full bg-white/50`}></span>
                            {char}
                         </li>
                       ))}
                     </ul>
                     <p className="text-[10px] text-white/40 mt-3 italic">* Operator may also generate custom identities.</p>
                  </div>
                </div>
              </div>

              {terminalState === 'IDLE' && (
                <button 
                  onClick={handlePlayMovie}
                  className="mt-6 w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-black uppercase tracking-widest text-white flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
                >
                  <Play size={20} /> Initialize Environment
                </button>
              )}
            </div>

            {/* Modal Right Side: Terminal/RPG UI */}
            <div className="p-4 md:p-6 md:w-[65%] bg-[#08080b] flex flex-col flex-grow h-full relative">
               
               {/* Terminal Header & Controls */}
               <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5 shrink-0">
                  <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono text-slate-500 uppercase tracking-widest">
                    <Terminal size={14} className={terminalState !== 'IDLE' ? "text-cyan-500" : "text-slate-600"}/>
                    {characterName ? `PERSPECTIVE: ${characterName.toUpperCase()}` : 'AWAITING EMBODIMENT'}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Terminal Actions */}
                    {terminalState !== 'IDLE' && (
                      <>
                        <button onClick={handleRewind} title="Rewind Simulation" className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          <RotateCcw size={16} />
                        </button>
                        <button onClick={handleDownloadLog} title="Export Log" disabled={chatLog.length < 3} className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent">
                          <Download size={16} />
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-2"></div>
                      </>
                    )}
                    
                    {/* Close Button */}
                    <button onClick={handleCloseModal} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                      <X size={20} />
                    </button>
                  </div>
               </div>
               
               {/* Log Output Area */}
               <div ref={terminalRef} className="flex-grow overflow-y-auto font-mono text-xs md:text-sm space-y-4 p-4 md:p-6 bg-[#030304] rounded-xl border border-white/5 custom-scrollbar mb-4">
                 {terminalState === 'IDLE' ? (
                    <div className="text-slate-600 flex items-center h-full justify-center text-center px-4">
                      _ Awaiting initialization command to bridge neural interface...
                    </div>
                 ) : (
                    <div className="space-y-6 pb-4">
                      {chatLog.map((entry) => (
                        <div key={entry.id} className={`flex flex-col ${entry.role === 'user' ? 'items-end' : 'items-start'}`}>
                          
                          {entry.role === 'system' && (
                            <div className="text-slate-500 w-full mb-2 opacity-70">{entry.text}</div>
                          )}

                          {entry.role === 'io' && (
                            <div className="max-w-[95%] bg-[#0a1520] border border-cyan-900/40 p-4 md:p-5 rounded-2xl rounded-tl-sm group relative shadow-lg">
                              <div className="flex justify-between items-start mb-3">
                                <div className="text-[10px] text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span> Oracle (Director)
                                </div>
                                
                                <button 
                                  onClick={() => handleListen(entry.id, entry.text)}
                                  disabled={audioLoadingId !== null}
                                  className={`text-slate-500 hover:text-cyan-400 transition-colors p-1 rounded ${playingAudioId === entry.id ? 'text-cyan-400 animate-pulse' : ''}`}
                                  title="Listen to archive"
                                >
                                  {audioLoadingId === entry.id ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
                                </button>
                              </div>
                              <div className="text-cyan-50 whitespace-pre-wrap leading-relaxed">{entry.text}</div>
                            </div>
                          )}

                          {entry.role === 'user' && (
                            <div className="max-w-[85%] bg-indigo-950/40 border border-indigo-500/20 p-4 rounded-2xl rounded-tr-sm shadow-md">
                               <div className="text-[10px] text-indigo-400 mb-2 uppercase tracking-widest text-right">
                                 {characterName ? characterName : 'Captain Odelis'}
                               </div>
                               <div className="text-indigo-100 whitespace-pre-wrap">{entry.text}</div>
                            </div>
                          )}

                        </div>
                      ))}
                      {terminalState === 'PROCESSING' && (
                         <div className="flex items-center gap-3 text-cyan-500/70 font-mono text-xs p-4">
                           <Loader2 size={16} className="animate-spin" />
                           Rendering simulation variables...
                         </div>
                      )}
                    </div>
                 )}
               </div>

               {/* Input Area */}
               <form onSubmit={handleSendMessage} className="shrink-0 flex gap-3 items-end">
                  <textarea 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={terminalState === 'IDLE' || terminalState === 'PROCESSING'}
                    placeholder={
                      terminalState === 'IDLE' ? "System offline..." : 
                      terminalState === 'AWAITING_CHARACTER' ? "Enter character name (e.g., 'The Rebel Leader')..." : 
                      "What do you do next? (Shift+Enter for new line)"
                    }
                    className="flex-grow bg-[#0f0f14] border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-inner resize-none min-h-[56px] max-h-[160px] custom-scrollbar"
                    rows={2}
                  />
                  <button 
                    type="submit"
                    disabled={!userInput.trim() || terminalState === 'IDLE' || terminalState === 'PROCESSING'}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-6 py-4 rounded-xl transition-colors flex items-center justify-center shrink-0 shadow-lg h-[56px]"
                  >
                    <Send size={20} />
                  </button>
               </form>
            </div>
          </div>
        </div>
      )}

      {/* --- REVIEW DESK MODAL --- */}
      {activeModal === 'REVIEW' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-2 md:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-[#120a06] border border-amber-500/20 rounded-2xl w-full max-w-5xl h-[90vh] shadow-2xl flex flex-col relative overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40 shrink-0">
              <div className="flex items-center gap-4 text-amber-500">
                <FileText size={28} />
                <div>
                  <h2 className="text-xl font-black tracking-widest uppercase">The Archivist's Desk</h2>
                  <p className="text-xs font-mono text-amber-500/60 uppercase">Node C7 - Literary Analysis & Critique</p>
                </div>
              </div>
              <button onClick={() => {setActiveModal(null); setReviewOutput(''); setReviewInput('');}} className="p-2 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-full">
                 <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-grow overflow-hidden flex flex-col md:flex-row h-full">
              
              {/* Input Section */}
              <div className="w-full md:w-1/2 p-6 flex flex-col h-full border-b md:border-b-0 md:border-r border-white/5">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-mono uppercase tracking-widest text-slate-400 block">
                    Paste Exported Log Data Here
                  </label>
                  
                  {/* File Upload Button */}
                  <label className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20 transition-colors cursor-pointer shadow-sm hover:shadow-cyan-500/20">
                    <Upload size={12}/> Upload .txt
                    <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                
                <textarea 
                  value={reviewInput}
                  onChange={(e) => setReviewInput(e.target.value)}
                  placeholder="STARSHIP VALINDRA // SIMULATION LOG..."
                  className="flex-grow bg-[#0a0502] border border-white/10 rounded-xl p-4 text-xs font-mono text-amber-100/70 focus:border-amber-500/50 outline-none resize-none custom-scrollbar shadow-inner"
                />
                <button 
                  onClick={handleReviewScript}
                  disabled={isReviewing || !reviewInput.trim()}
                  className="mt-4 w-full py-4 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/30 text-amber-400 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shrink-0"
                >
                  {isReviewing ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                  {isReviewing ? 'C7 is Analyzing Narrative Flow...' : 'Submit for Review'}
                </button>
              </div>

              {/* Output Section */}
              <div className="w-full md:w-1/2 p-6 flex flex-col h-full bg-[#050201]">
                <div className="flex justify-between items-center mb-3">
                   <h3 className="text-xs font-mono uppercase tracking-widest text-amber-500/70">C7's Analysis</h3>
                   {reviewOutput && (
                     <button 
                       onClick={handleDownloadReview}
                       className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 text-amber-400 hover:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 transition-colors"
                     >
                       <Download size={12}/> Export Critique
                     </button>
                   )}
                </div>
                
                <div className="flex-grow bg-[#000] border border-white/5 rounded-xl p-6 text-sm text-amber-50 overflow-y-auto custom-scrollbar font-sans leading-relaxed whitespace-pre-wrap shadow-inner relative">
                  {reviewOutput ? (
                    <div className="animate-fade-in pb-4">
                      <div className="text-[10px] text-amber-500/50 font-mono mb-5 border-b border-amber-500/20 pb-3">REVIEW COMPLETE // TIMESTAMP: {new Date().toISOString()}</div>
                      {reviewOutput}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-900/50 text-center p-6">
                      <CheckCircle size={48} className="mb-4 opacity-50" />
                      <p className="text-xs max-w-xs leading-relaxed uppercase tracking-widest">Awaiting data injection. Node C7 is standing by to evaluate your character performance.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; border: 2px solid transparent; background-clip: padding-box;} 
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        
        .custom-select {
           background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
           background-repeat: no-repeat;
           background-position: right 1rem center;
           background-size: 1em;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}