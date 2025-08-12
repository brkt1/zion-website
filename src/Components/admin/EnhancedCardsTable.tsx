import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import { RarityBadge } from "./CardVisuals/RarityBadge";
import { PlayerAvatar } from "./CardVisuals/PlayerAvatar";
import { StatsRadarChart } from "./CardVisuals/StatsRadarChart";
import { AttributePills } from "./CardVisuals/AttributePills";
import { DurationBar } from "./CardVisuals/DurationBar"; 
export default function EnhancedCardsTable() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("enhanced_cards")
          .select(`*`)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        setCards(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this card?")) return;
    try {
      const { error } = await supabase
        .from("enhanced_cards")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      setCards(cards.filter(card => card.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-500 text-red-300 p-4 rounded-lg max-w-2xl mx-auto text-center">
        Error loading cards: {error}
      </div>
    );
  }

  return (
    <div className="bg-black-secondary rounded-xl overflow-hidden border border-yellow-700/50 shadow-lg">
      <div className="grid grid-cols-12 bg-black-secondary text-cream p-4 font-bold text-sm border-b border-yellow-600/50">
        <div className="col-span-1">CARD</div>
        <div className="col-span-3">PLAYER</div>
        <div className="col-span-2">TEAM</div>
        <div className="col-span-2">STATS</div>
        <div className="col-span-2">RARITY</div>
        <div className="col-span-2 text-right">ACTIONS</div>
      </div>
      
      <div className="divide-y divide-yellow-900/50">
        {cards.map((card) => (
          <React.Fragment key={card.id}>
            <div 
              className="grid grid-cols-12 p-4 hover:bg-yellow-900/10 cursor-pointer transition-colors"
              onClick={() => toggleExpand(card.id)}
            >
              <div className="col-span-1 flex items-center">
                <div className="bg-black-primary border border-yellow-700 rounded-lg w-12 h-16 flex items-center justify-center">
                  <span className="font-mono text-yellow-400 font-bold">#{card.card_number}</span>
                </div>
              </div>
              
              <div className="col-span-3 flex items-center">
                <PlayerAvatar 
                  name={card.player_name} 
                  position={card.player_position} 
                />
                <div className="ml-3">
                  <div className="font-bold text-white">{card.player_name}</div>
                  <div className="text-xs text-gray-300">{card.player_position}</div>
                </div>
              </div>
              
              <div className="col-span-2 flex items-center">
                <div className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                  {card.player_team}
                </div>
              </div>
              
              <div className="col-span-2">
                <DurationBar duration={card.duration} max={90} />
              </div>
              
              <div className="col-span-2">
                <RarityBadge rarity={card.card_rarity} />
              </div>
              
              <div className="col-span-2 flex justify-end space-x-2">
                <Link
                  to={`/admin/cards/${card.id}/edit`}
                  className="text-yellow-500 hover:text-yellow-300 transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  <PencilIcon />
                </Link>
                <button
                  className="text-red-500 hover:text-red-300 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(card.id);
                  }}
                >
                  <TrashIcon />
                </button>
                <button 
                  className={`ml-2 transform transition-transform ${expandedCard === card.id ? 'rotate-180' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(card.id);
                  }}
                >
                  <ChevronDownIcon />
                </button>
              </div>
            </div>
            
            {expandedCard === card.id && (
              <div className="grid grid-cols-12 gap-4 p-4 bg-black-primary/80">
                <div className="col-span-5">
                  <div className="text-sm font-bold text-yellow-500 mb-2">PLAYER STATS</div>
                  <StatsRadarChart stats={card.player_stats} />
                </div>
                
                <div className="col-span-4">
                  <div className="text-sm font-bold text-yellow-500 mb-2">ATTRIBUTES</div>
                  <AttributePills attributes={card.card_attributes} />
                </div>
                
                <div className="col-span-3 text-sm">
                  <div className="mb-2">
                    <span className="text-gray-400">Created by: </span>
                    <span className="text-white">{card.created_by}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-gray-400">Created at: </span>
                    <span className="text-white">
                      {new Date(card.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Game type: </span>
                    <span className="text-yellow-400">{card.game_type}</span>
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// Icons for actions
const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);