import React, { useState } from 'react';
import { MOCK_AGENTS } from '../constants';
import { AgentCard } from '../components/AgentCard';
import { Search } from 'lucide-react';

export const AgentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAgents = MOCK_AGENTS.filter(agent => 
    `${agent.firstName} ${agent.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.agencyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-32 pb-20 min-h-screen bg-transparent">
      <div className="container mx-auto px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4 font-serif">Our Agents</h1>
            <p className="text-slate-500 dark:text-slate-400 font-light text-lg max-w-xl">
              Meet the elite professionals redefining real estate service in Nigeria.
            </p>
          </div>

          <div className="w-full md:w-96 relative group">
            <input 
              type="text" 
              placeholder="Find an agent..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/80 dark:bg-slate-800 border border-white/50 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-200 transition-all shadow-sm"
            />
            <Search className="absolute left-4 top-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" size={20} />
          </div>
        </div>

        {filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-gray-500 text-lg">No agents found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};