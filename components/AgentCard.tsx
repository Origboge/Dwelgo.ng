import React from 'react';
import { Agent } from '../types';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  return (
    <Link to={`/agents/${agent.id}`} className="group block relative w-full bg-white dark:bg-slate-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 dark:border-gray-700">
            <img
              src={agent.avatar}
              alt={`${agent.firstName} ${agent.lastName}`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-zillow-600 hover:underline truncate">{agent.firstName} {agent.lastName}</h3>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate mb-1">{agent.agencyName}</p>
          <div className="flex items-center gap-1 text-sm text-slate-700 dark:text-slate-300 font-medium">
            <span className="flex items-center text-yellow-500"><Star size={12} fill="currentColor" className="mr-1" /> {agent.rating?.toFixed(1) || '0.0'}</span>
            <span className="text-slate-300 mx-1">|</span>
            <span className="text-xs text-slate-500">{agent.experience ? `${agent.experience} yrs exp` : 'Top Agent'}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs font-bold text-zillow-600">
        <span>View Profile</span>
      </div>
    </Link>
  );
};