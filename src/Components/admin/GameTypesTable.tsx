import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import { toast } from "react-hot-toast";
import { PlayerAvatar } from "./CardVisuals/PlayerAvatar";
import { DurationBar } from "./CardVisuals/DurationBar";
import { StatsRadarChart } from "./CardVisuals/StatsRadarChart";
import { AttributePills } from "./CardVisuals/AttributePills";
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  PencilIcon, 
  TrashIcon,
  FilterIcon,
  RefreshIcon
} from "./Icons";

interface EnhancedCard {
  id: string;
  card_number: number;
  duration: number;
  game_type_id: string;
  route_access: string[];
  used: boolean;
  created_at: string;
  player_id: string | null;
  created_by: string | null;
  player_name: string;
  player_position: string;
  player_team: string;
  card_rarity: string;
  game_type: string;
}

const ITEMS_PER_PAGE = 10;

export default function EnhancedCardsTable() {
  const [cards, setCards] = useState<EnhancedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCards, setTotalCards] = useState(0);
  const [filter, setFilter] = useState({
    selectedGameType: '',
    selectedTeam: '',
    selectedRarity: '',
  });
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const { selectedGameType, selectedTeam, selectedRarity } = filter;
      
      let query = supabase
        .from('enhanced_cards_with_profile')
        .select('*', { count: 'exact' })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1)
        .order("created_at", { ascending: false });

      if (selectedGameType) query = query.eq('game_type_id', selectedGameType);
      if (selectedTeam) query = query.eq('player_team', selectedTeam);
      if (selectedRarity) query = query.eq('card_rarity', selectedRarity);

      const { data, error, count } = await query;

      if (error) throw new Error(error.message || 'Failed to fetch cards');
      
      setCards(data || []);
      setTotalCards(count || 0);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast.error("Failed to load cards");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [page, filter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this card?")) return;
    try {
      const { error } = await supabase
        .from("enhanced_cards")
        .delete()
        .eq("id", id);
      
      if (error) throw new Error(error.message);
      
      setCards(cards.filter(card => card.id !== id));
      setSelectedCards(selectedCards.filter(cardId => cardId !== id));
      toast.success("Card deleted successfully");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast.error("Failed to delete card");
    }
  };

  const handleBatchDelete = async () => {
    if (!selectedCards.length || !confirm(`Delete ${selectedCards.length} selected cards?`)) return;
    try {
      const { error } = await supabase
        .from("enhanced_cards")
        .delete()
        .in("id", selectedCards);
      
      if (error) throw new Error(error.message);
      
      setCards(cards.filter(card => !selectedCards.includes(card.id)));
      setSelectedCards([]);
      toast.success(`${selectedCards.length} cards deleted`);
    } catch (err: any) {
      setError(err.message);
      toast.error("Batch delete failed");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const toggleSelectCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCards(prev => 
      prev.includes(id) 
        ? prev.filter(cardId => cardId !== id) 
        : [...prev, id]
    );
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCards(cards.map(card => card.id));
    } else {
      setSelectedCards([]);
    }
  };

  const resetFilters = () => {
    setFilter({
      selectedGameType: '',
      selectedTeam: '',
      selectedRarity: '',
    });
  };

  const totalPages = Math.ceil(totalCards / ITEMS_PER_PAGE);

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
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

  // Extract unique filter options
  const teamOptions = Array.from(new Set(cards.map(card => card.player_team)));
  const rarityOptions = Array.from(new Set(cards.map(card => card.card_rarity)));
  const gameTypeOptions = Array.from(new Set(cards.map(card => card.game_type)));

  return (
    <div className="bg-black-secondary rounded-xl overflow-hidden border border-black-primary shadow-lg">
      {/* Header and Controls */}
      <div className="p-4 border-b border-black-primary flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Enhanced Cards</h2>
          <button 
            onClick={fetchCards}
            disabled={isRefreshing}
            className="text-gray-400 hover:text-amber-400 transition-colors"
            aria-label="Refresh cards"
          >
            <RefreshIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-3 py-2 bg-gray-800 hover:bg-black-primary rounded-lg text-sm transition-colors"
          >
            <FilterIcon className="w-4 h-4" />
            <span>Filters</span>
          </button>
          
          {selectedCards.length > 0 && (
            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Delete ({selectedCards.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 border-b border-black-primary bg-gray-800/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Team</label>
              <select
                value={filter.selectedTeam}
                onChange={(e) => setFilter({...filter, selectedTeam: e.target.value})}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-black-primary focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="">All Teams</option>
                {teamOptions.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Rarity</label>
              <select
                value={filter.selectedRarity}
                onChange={(e) => setFilter({...filter, selectedRarity: e.target.value})}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-black-primary focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="">All Rarities</option>
                {rarityOptions.map(rarity => (
                  <option key={rarity} value={rarity}>{rarity}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Game Type</label>
              <select
                value={filter.selectedGameType}
                onChange={(e) => setFilter({...filter, selectedGameType: e.target.value})}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-black-primary focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="">All Game Types</option>
                {gameTypeOptions.map((gameType, index) => (
                  <option key={index} value={gameType}>{gameType}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 text-sm rounded-lg bg-black-primary hover:bg-gray-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {/* Table Header - Desktop */}
        <div className="min-w-[800px]">
          <div className="grid grid-cols-12 bg-gray-800 text-gray-300 p-4 font-semibold text-xs uppercase tracking-wider border-b border-black-primary">
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={selectedCards.length > 0 && selectedCards.length === cards.length}
                onChange={toggleSelectAll}
                className="mr-3 h-4 w-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500"
              />
              <span>Card</span>
            </div>
            <div className="col-span-3">Player</div>
            <div className="col-span-2">Team</div>
            <div className="col-span-2">Game Type</div>
            <div className="col-span-2">Rarity</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          
          {/* Cards List */}
          <div className="divide-y divide-gray-800">
            {cards.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No cards found matching your criteria
              </div>
            ) : (
              cards.map((card) => (
                <React.Fragment key={card.id}>
                  <div 
                    className={`flex justify-between p-4 cursor-pointer transition-colors  ${
                      expandedCard === card.id 
                        ? 'bg-gray-800/50' 
                        : 'hover:bg-gray-800/30'
                    }`}
                    onClick={() => toggleExpand(card.id)}
                  >  <input
                        type="checkbox"
                        checked={selectedCards.includes(card.id)}
                        onChange={(e) => e.stopPropagation()}
                        onClick={(e) => toggleSelectCard(card.id, e)}
                        className="mr-3 h-4 w-4 m-11 rounded text-amber-500 focus:ring-amber-500"
                      /> 
                    <div className="col-span-1 flex items-center">
                     <div className=" rounded-lg w-12 h-16 flex items-center justify-center">
                        <span className="font-mono text-amber-400 font-bold ">#{card.card_number}</span>
                      </div>
                    
                    </div>
                    
                    <div className="col-span-3 flex items-center">
                      <PlayerAvatar 
                        name={card.player_name || ''} 
                        position={card.player_position} 
                        rarity={card.card_rarity}
                      />
                      <div className="ml-3">
                        <div className="font-semibold text-white">{card.player_name}</div>
                        <div className="text-xs text-gray-400">{card.player_position}</div>
                      </div>
                    </div>
                    
                    <div className="col-span-2 flex items-center">
                      <div className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                        {card.player_team}
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <div className="bg-gray-800 px-3 py-1 rounded-full text-sm inline-block">
                        {card.game_type}
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        card.card_rarity === 'Common' ? 'bg-blue-500/20 text-blue-300' :
                        card.card_rarity === 'Rare' ? 'bg-purple-500/20 text-purple-300' :
                        card.card_rarity === 'Epic' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-pink-500/20 text-pink-300'
                      }`}>
                        {card.card_rarity}
                      </span>
                    </div>
                    
                    <div className="col-span-2 flex justify-end space-x-2">
                      <Link
                        to={`/admin/cards/${card.id}/edit`}
                        className="text-gray-400 hover:text-amber-400 transition-colors p-1"
                        onClick={e => e.stopPropagation()}
                        aria-label={`Edit ${card.player_name}`}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </Link>
                      <button
                        className="text-gray-400 hover:text-red-400 transition-colors p-1"
                        aria-label={`Delete ${card.player_name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(card.id);
                        }}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                      <button 
                        className="text-gray-400 hover:text-white transition-colors p-1"
                        aria-label={expandedCard === card.id ? "Collapse details" : "Expand details"}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(card.id);
                        }}
                      >
                        {expandedCard === card.id 
                          ? <ChevronUpIcon className="w-5 h-5" /> 
                          : <ChevronDownIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  {expandedCard === card.id && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 bg-gray-800/40">
                      <div className="lg:col-span-5">
                        <div className="text-sm font-semibold text-amber-400 mb-3">PLAYER STATS</div>
                        <div className="bg-gray-800/50 rounded-lg p-4 h-64">
                          <StatsRadarChart stats={{}} />
                        </div>
                      </div>
                      
                      <div className="lg:col-span-4">
                        <div className="text-sm font-semibold text-amber-400 mb-3">ATTRIBUTES</div>
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <AttributePills attributes={card.route_access} />
                        </div>
                        
                        <div className="mt-4">
                          <div className="text-sm font-semibold text-amber-400 mb-2">DURATION</div>
                          <DurationBar duration={card.duration} />
                        </div>
                      </div>
                      
                      <div className="lg:col-span-3 text-sm">
                        <div className="text-sm font-semibold text-amber-400 mb-3">METADATA</div>
                        <div className="space-y-3">
                          <div>
                            <div className="text-gray-400 text-xs">Created by</div>
                            <div className="text-white">{card.created_by || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-xs">Created at</div>
                            <div className="text-white">
                              {new Date(card.created_at).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-xs">Status</div>
                            <div className="text-white">
                              {card.used 
                                ? <span className="text-red-400">Used</span> 
                                : <span className="text-green-400">Available</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-black-primary">
          <div className="text-sm text-gray-400 mb-4 sm:mb-0">
            Showing <span className="font-semibold">{(page - 1) * ITEMS_PER_PAGE + 1}</span> to 
            <span className="font-semibold"> {Math.min(page * ITEMS_PER_PAGE, totalCards)}</span> of 
            <span className="font-semibold"> {totalCards}</span> cards
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-lg border border-black-primary bg-gray-800 disabled:opacity-40 hover:bg-black-priborder-black-primary transition-colors"
              aria-label="Previous page"
            >
              Previous
            </button>
            
            <div className="flex bg-gray-800 rounded-lg p-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Calculate page number based on current position
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-md transition-colors ${
                      page === pageNum 
                        ? 'bg-amber-600 text-white' 
                        : 'hover:bg-black-primary'
                    }`}
                    aria-label={`Page ${pageNum}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded-lg border border-black-primary bg-gray-800 disabled:opacity-40 hover:bg-black-priborder-black-primary transition-colors"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}