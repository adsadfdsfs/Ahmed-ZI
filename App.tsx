
import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import CreatorFlow from './components/CreatorFlow';
import CharacterSheet from './components/CharacterSheet';
import Settings from './components/Settings';
import AdventureView from './components/AdventureView';
import StoryMakerView from './components/StoryMakerView';
import CommunityLibrary from './components/CommunityLibrary';
import VaultView from './components/VaultView';
import { View, Character, World } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('LANDING');
  const [character, setCharacter] = useState<Character | null>(null);
  const [activeWorld, setActiveWorld] = useState<World | null>(null);

  const navigate = (view: View) => {
    setCurrentView(view);
  };

  const handleCharacterGenerated = (newCharacter: Character) => {
    // Persistent auto-save to local vault
    const existing = JSON.parse(localStorage.getItem('my_characters') || '[]');
    const characterWithId = newCharacter.id ? newCharacter : { ...newCharacter, id: `char-${Date.now()}` };
    
    // Check if updating or adding new
    const index = existing.findIndex((c: Character) => c.id === characterWithId.id);
    if (index >= 0) {
      existing[index] = characterWithId;
    } else {
      existing.unshift(characterWithId);
    }
    
    localStorage.setItem('my_characters', JSON.stringify(existing));
    setCharacter(characterWithId);
  };

  const handleUpdateCharacter = (updatedCharacter: Character) => {
    const existing = JSON.parse(localStorage.getItem('my_characters') || '[]');
    const index = existing.findIndex((c: Character) => c.id === updatedCharacter.id);
    if (index >= 0) {
      existing[index] = updatedCharacter;
      localStorage.setItem('my_characters', JSON.stringify(existing));
    }
    setCharacter(updatedCharacter);
  };

  const handleWorldManifested = (world: World) => {
    const existing = JSON.parse(localStorage.getItem('my_worlds') || '[]');
    const worldWithId = world.id ? world : { ...world, id: `world-${Date.now()}` };
    
    const index = existing.findIndex((w: World) => w.id === worldWithId.id);
    if (index >= 0) {
      existing[index] = worldWithId;
    } else {
      existing.unshift(worldWithId);
    }
    
    localStorage.setItem('my_worlds', JSON.stringify(existing));
    setActiveWorld(worldWithId);
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
          onUpdateCharacter={handleUpdateCharacter}
        />
      )}

      {currentView === 'SETTINGS' && (
        <Settings onNavigate={navigate} />
      )}

      {currentView === 'ADVENTURE' && (
        <AdventureView onNavigate={navigate} />
      )}

      {currentView === 'STORY_MAKER' && (
        <StoryMakerView 
          onNavigate={navigate} 
          initialWorld={activeWorld}
          onSaveWorld={handleWorldManifested}
        />
      )}

      {currentView === 'LIBRARY' && (
        <CommunityLibrary 
          onNavigate={navigate} 
          onImportCharacter={handleCharacterGenerated}
          onImportWorld={handleWorldManifested}
        />
      )}

      {currentView === 'VAULT' && (
        <VaultView 
          onNavigate={navigate}
          onLoadCharacter={setCharacter}
          onLoadWorld={setActiveWorld}
        />
      )}
    </div>
  );
};

export default App;
