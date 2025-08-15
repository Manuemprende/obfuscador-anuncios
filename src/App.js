import { useState, useCallback } from 'react';

/* ===== helpers fuera del componente ===== */
const HOMOGLYPH_MAP = {
  a: 'а', A: 'А',
  e: 'е', E: 'Е',
  o: 'о', O: 'О',
  c: 'с', C: 'С',
  p: 'р', P: 'Р',
  x: 'х', X: 'Х',
  s: 'ѕ', S: 'Ѕ',
  l: 'Ӏ',
};

function applyObfuscationToWord(word) {
  let result = '';
  for (const char of word) {
    const obfuscatedChar = HOMOGLYPH_MAP[char] || char;
    result += obfuscatedChar;
    result += '\u200c';
  }
  return result;
}
/* ======================================== */

const App = () => {
  const [inputText, setInputText] = useState('');
  const [wordsToObfuscate, setWordsToObfuscate] = useState('');
  const [obfuscatedText, setObfuscatedText] = useState('');
  const [message, setMessage] = useState('');
  const [selectedWord, setSelectedWord] = useState('');

  const obfuscateText = useCallback(() => {
    if (!inputText || !wordsToObfuscate) {
      setObfuscatedText('');
      setMessage('Por favor, ingresa el texto y las palabras clave.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const wordsList = wordsToObfuscate
      .split(',')
      .map(w => w.trim())
      .filter(Boolean);

    if (wordsList.length === 0) {
      setObfuscatedText(inputText);
      return;
    }

    const pattern = wordsList
      .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');

    const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

    const result = inputText.replace(regex, match =>
      applyObfuscationToWord(match)
    );

    setObfuscatedText(result);
  }, [inputText, wordsToObfuscate]);

  const copyToClipboard = useCallback(() => {
    try {
      const el = document.createElement('textarea');
      el.value = obfuscatedText;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);

      setMessage('¡Texto copiado!');
      setTimeout(() => setMessage(''), 2000);
    } catch {
      setMessage('Error al copiar el texto.');
      setTimeout(() => setMessage(''), 2000);
    }
  }, [obfuscatedText]);

  const handleTextSelection = e => {
    const text = e.target.value;
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    let selected = text.substring(start, end).trim();
    selected = selected.replace(/^[^a-zA-Z0-9\s]+|[^a-zA-Z0-9\s]+$/g, '');
    if (selected && selected.indexOf(' ') === -1) setSelectedWord(selected);
    else setSelectedWord('');
  };

  const addSelectedWord = () => {
    if (selectedWord) {
      const words = wordsToObfuscate
        .split(',')
        .map(w => w.trim())
        .filter(Boolean);
      if (!words.includes(selectedWord)) {
        const newWords =
          words.length > 0 ? `${wordsToObfuscate}, ${selectedWord}` : selectedWord;
        setWordsToObfuscate(newWords);
      }
      setSelectedWord('');
    }
  };

  const clearAll = () => {
    setInputText('');
    setWordsToObfuscate('');
    setObfuscatedText('');
    setMessage('');
    setSelectedWord('');
  };

  return (
    <div className="app">
      <div className="card">
        <h1 className="center-title">
          <span className="gradient-text">Ofuscador</span> de Anuncios
        </h1>

        <p className="center-subtitle">
          Transforma tu texto para evitar filtros, seleccionando solo las palabras
          clave que necesitas ofuscar.
        </p>

        <div className="stack">
          <div className="field">
            <label htmlFor="wordsInput" className="center-label">
              1. Palabras clave a ofuscar (separadas por comas):
            </label>
            <input
              type="text"
              id="wordsInput"
              value={wordsToObfuscate}
              onChange={e => setWordsToObfuscate(e.target.value)}
              placeholder="Ej: dinero, gratis, oferta"
              className="input"
            />
          </div>

          <div className="field">
            <label htmlFor="textInput" className="center-label">
              2. Ingresa tu texto de anuncio aquí:
            </label>
            <textarea
              id="textInput"
              rows="8"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onSelect={handleTextSelection}
              placeholder="Escribe tu anuncio aquí..."
              className="textarea"
            />
            {selectedWord && (
              <div className="center mt-12">
                <button onClick={addSelectedWord} className="btn btn-fuchsia">
                  Agregar “{selectedWord}”
                </button>
              </div>
            )}
          </div>

          <button onClick={obfuscateText} className="btn btn-primary full">
            Ofuscar Palabras Clave
          </button>

          <div className="field">
            <label htmlFor="obfuscatedTextOutput" className="center-label">
              3. Texto Ofuscado:
            </label>
            <textarea
              id="obfuscatedTextOutput"
              rows="8"
              value={obfuscatedText}
              readOnly
              className="textarea textarea-readonly"
            />
          </div>

          <div className="row mt-12" style={{ gap: '10px' }}>
            <button
              onClick={copyToClipboard}
              disabled={!obfuscatedText}
              className={`btn ${obfuscatedText ? 'btn-gold' : 'btn-disabled'}`}
            >
              Copiar al portapapeles
            </button>
            <button
              onClick={clearAll}
              className="btn btn-danger"
            >
              Limpiar Todo
            </button>
            <span className="message">{message}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
