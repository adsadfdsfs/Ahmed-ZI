
import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import CreatorFlow from './components/CreatorFlow';
import CharacterSheet from './components/CharacterSheet';
import Settings from './components/Settings';
import { View, Character } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('LANDING');
  const [character, setCharacter] = useState<Character | null>(null);

  const navigate = (view: View) => {
    setCurrentView(view);
  };

  const handleCharacterGenerated = (newCharacter: Character) => {
    setCharacter(newCharacter);
  };

  return (
    <div className="bg-slate-950 text-slate-100 selection:bg-amber-500/30">
      {currentView === 'LANDING' && (
        <LandingPage onNavigate={navigate} />
      )}
      
      {currentView === 'CREATOR' && (
        <CreatorFlow 
          onNavigate={navigate} 
          onCharacterGenerated={handleCharacterGenerated} 
        />
      )}
      
      {currentView === 'SHEET' && character && (
        <CharacterSheet 
          character={character} 
          onNavigate={navigate} 
        />
      )}

      {currentView === 'SETTINGS' && (
        <Settings onNavigate={navigate} />
      )}
    </div>
  );
};

export default App;
