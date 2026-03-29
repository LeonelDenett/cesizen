'use client';

interface EmotionLevel2 {
  id: string;
  name: string;
}

interface EmotionLevel1 {
  id: string;
  name: string;
  level2: EmotionLevel2[];
}

interface EmotionLevelSelectorProps {
  emotions: EmotionLevel1[];
  selectedLevel1Id: string;
  selectedLevel2Id: string;
  onLevel1Change: (id: string) => void;
  onLevel2Change: (id: string) => void;
}

export default function EmotionLevelSelector({
  emotions,
  selectedLevel1Id,
  selectedLevel2Id,
  onLevel1Change,
  onLevel2Change,
}: EmotionLevelSelectorProps) {
  const selectedLevel1 = emotions.find((e) => e.id === selectedLevel1Id);
  const level2Options = selectedLevel1?.level2 ?? [];

  function handleLevel1Change(value: string) {
    onLevel1Change(value);
    onLevel2Change('');
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="emotionLevel1" className="block text-sm font-medium text-gray-700 mb-1">
          Émotion Niveau 1 <span className="text-red-500">*</span>
        </label>
        <select
          id="emotionLevel1"
          value={selectedLevel1Id}
          onChange={(e) => handleLevel1Change(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        >
          <option value="">— Sélectionner une émotion —</option>
          {emotions.map((emotion) => (
            <option key={emotion.id} value={emotion.id}>
              {emotion.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="emotionLevel2" className="block text-sm font-medium text-gray-700 mb-1">
          Émotion Niveau 2 <span className="text-red-500">*</span>
        </label>
        <select
          id="emotionLevel2"
          value={selectedLevel2Id}
          onChange={(e) => onLevel2Change(e.target.value)}
          disabled={!selectedLevel1Id}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
        >
          <option value="">
            {selectedLevel1Id ? '— Sélectionner une émotion —' : '— Sélectionnez d\u0027abord le niveau 1 —'}
          </option>
          {level2Options.map((emotion) => (
            <option key={emotion.id} value={emotion.id}>
              {emotion.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
