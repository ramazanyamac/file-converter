import { useState, ChangeEvent, useEffect } from 'react';
import Papa from 'papaparse';
import { languageOptions } from './config/languages';

interface ParsedData {
  [key: string]: string | number | boolean | null;
}

interface PapaParseResult {
  data: ParsedData[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

function App() {
  const [data, setData] = useState<ParsedData[] | null>(null);
  const [filteredData, setFilteredData] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ENGLISH');
  const [autoDownload, setAutoDownload] = useState(true);

  // Update filtered data when language or data changes
  useEffect(() => {
    if (data) {
      const filtered = data.reduce<Record<string, string>>((acc, item) => {
        const key = item.key;
        const value = item[selectedLanguage];
        if (typeof key === 'string' && typeof value === 'string') {
          acc[key] = value;
        }
        return acc;
      }, {});
      setFilteredData(filtered);
    }
  }, [data, selectedLanguage]);

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(event.target.value);
  };

  const downloadJson = (filtered: Record<string, string>) => {
    const json = JSON.stringify(filtered, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedLanguage.toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setIsLoading(true);
    setData(null);
    setFilteredData(null);

    Papa.parse<ParsedData>(file, {
      complete: (results: PapaParseResult) => {
        setIsLoading(false);
        
        if (results.errors.length > 0) {
          setError('Error parsing CSV file. Please check the file format.');
          return;
        }

        setData(results.data);
        
        // Convert filtered data to JSON and trigger download if autoDownload is enabled
        const filtered = results.data.reduce<Record<string, string>>((acc, item) => {
          const key = item.key;
          const value = item[selectedLanguage];
          if (typeof key === 'string' && typeof value === 'string') {
            acc[key] = value;
          }
          return acc;
        }, {});

        if (autoDownload) {
          downloadJson(filtered);
        }
      },
      error: () => {
        setIsLoading(false);
        setError('Error reading file. Please try again.');
      },
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CSV to JSON Converter</h1>
          <p className="text-gray-600 mb-8">Upload your CSV file and get the JSON output</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Language
            </label>
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoDownload}
                onChange={(e) => setAutoDownload(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">Auto-download JSON file</span>
            </label>
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Choose CSV File
            </label>
            <p className="mt-2 text-sm text-gray-500">or drag and drop your CSV file here</p>
          </div>

          {isLoading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Converting your file...</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {filteredData && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2 flex-col gap-4">
              {!autoDownload && (
                  <button
                    onClick={() => downloadJson(filteredData)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full"
                  >
                    Download JSON
                  </button>
                )}
                <h2 className="text-lg font-semibold text-gray-900">
                  Preview ({selectedLanguage}):
                </h2>
                
              </div>
              <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
                <pre className="text-sm text-gray-700">
                  {JSON.stringify(filteredData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
