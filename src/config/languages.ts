export interface LanguageOption {
  value: string;
  label: string;
}

export const languageOptions: LanguageOption[] = [
  { value: 'TÜRKÇE', label: 'Türkçe' },
  { value: 'ENGLISH', label: 'English' },
  { value: 'FRENCH', label: 'French' },
  { value: 'GERMAN', label: 'German' },
  { value: 'JAPANESE', label: 'Japanese' },
  { value: 'PORTUGUESE-BRAZIL', label: 'Portuguese (Brazil)' },
  { value: 'SPANISH', label: 'Spanish' },
  { value: 'RUSSIAN', label: 'Russian' },
  { value: 'INDONESIAN', label: 'Indonesian' }
];

export const getLanguageByValue = (value: string): LanguageOption | undefined => {
  return languageOptions.find(lang => lang.value === value);
};